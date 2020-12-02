import React, { Component } from 'react'
import ItkVtkSegRendering from './ItkVtkSegRendering'
import DICOMSeriesRenderer from './DICOMSeriesRenderer'
import SegRenderer from './SegRenderer'

import controlPanel from './controlPanel.html'

import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow'

import vtkCubeSource from 'vtk.js/Sources/Filters/Sources/CubeSource'
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper'
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor'

import vtkLight from 'vtk.js/Sources/Rendering/Core/Light'

class App extends Component {
  state = {
    fullScreenRenderer: vtkFullScreenRenderWindow.newInstance(),
  }

  async componentDidMount(){
    this.state.fullScreenRenderer.addController(controlPanel)

    const segs = [
      await SegRenderer(`${window.location.href}/../dicoms/rightEyeSeg.dcm`, this.state.fullScreenRenderer, [255, 0, 0]),
      await SegRenderer(`${window.location.href}/../dicoms/leftEyeSeg.dcm`, this.state.fullScreenRenderer, [255, 0, 0]),
      await SegRenderer(`${window.location.href}/../dicoms/brainSeg.dcm`, this.state.fullScreenRenderer, [0, 0, 255])
    ]

    const series = await DICOMSeriesRenderer(this.state.fullScreenRenderer)

    console.log({
      segs,
      series
    })

    this.setState({
      seriesActor: series.actor,
      seriesMarchingCubes: series.marchingCubes,

      segActors: segs.map(seg => seg.actor),
      segMarchingCubes: segs.map(seg => seg.marchingCubes),
    })

    const setSegOpacity = e => {
      if (this.state.segActors){
        this.state.segActors.forEach((actor, i) => {
          actor.getProperty().setOpacity(Number(e.target.value))
        });
      }
    }

    const setSegEdgeVisibility = e => {
      if (this.state.segActors){
        this.state.segActors.forEach((actor, i) => {
          actor.getProperty().setEdgeVisibility(!!e.target.checked)
        });
      }
    }

    const setSegNormals = e => {
      if (this.state.segMarchingCubes){
        this.state.segMarchingCubes.forEach((mCubes, i) => {
          mCubes.setComputeNormals(!!e.target.checked)
        });
      }
    }

    const setSegMerge = e => {
      if (this.state.segMarchingCubes){
        this.state.segMarchingCubes.forEach((mCubes, i) => {
          mCubes.setMergePoints(!!e.target.checked)
        });
      }
    }

    const setScanOpacity = e => {
      if (this.state.seriesActor){
        this.state.seriesActor.getProperty().setOpacity(Number(e.target.value))
      }
    }

    const setScanEdgeVisibility = e => {
      if (this.state.seriesActor){
        this.state.seriesActor.getProperty().setEdgeVisibility(!!e.target.checked)
      }
    }

    const setScanNormals = e => {
      if (this.state.seriesMarchingCubes){
        this.state.seriesMarchingCubes.setComputeNormals(!!e.target.checked)
      }
    }

    const setScanMerge = e => {
      if (this.state.seriesMarchingCubes){
        this.state.seriesMarchingCubes.setMergePoints(!!e.target.checked)
      }
    }

    document.querySelector('.segTransparency').addEventListener('input', setSegOpacity.bind(this))
    document.querySelector('.segEdgeVisibility').addEventListener('input', setSegEdgeVisibility.bind(this))
    document.querySelector('.segNormals').addEventListener('input', setSegNormals.bind(this))
    document.querySelector('.segMerge').addEventListener('input', setSegMerge.bind(this))

    document.querySelector('.scanTransparency').addEventListener('input', setScanOpacity.bind(this))
    document.querySelector('.scanEdgeVisibility').addEventListener('input', setScanEdgeVisibility.bind(this))
    document.querySelector('.scanNormals').addEventListener('input', setScanNormals.bind(this))
    document.querySelector('.scanMerge').addEventListener('input', setScanMerge.bind(this))


    /*const cube = vtkCubeSource.newInstance()
    const mapper = vtkMapper.newInstance()
    const actor = vtkActor.newInstance()

    mapper.setInputConnection(cube.getOutputPort())
    actor.setMapper(mapper)
    actor.getProperty().setOpacity(0.5)

    console.log(cube)

    const renderer = this.state.fullScreenRenderer.getRenderer()
    const renderWindow = this.state.fullScreenRenderer.getRenderWindow()

    renderer.addActor(actor)
    renderer.resetCamera()
    renderWindow.render()*/

  }

  render(){
    return (<h1>Loading...</h1>)
  }
}

export default App;
