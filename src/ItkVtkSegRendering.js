import React, { Component } from 'react'
import PropTypes from 'prop-types'

import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow'
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor'
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper'
import vtkImageMarchingCubes from 'vtk.js/Sources/Filters/General/ImageMarchingCubes'
import vtkITKHelper from 'vtk.js/Sources/Common/DataModel/ITKHelper'
import readImageDICOMFileSeries from 'itk/readImageDICOMFileSeries'

import vtkCubeSource from 'vtk.js/Sources/Filters/Sources/CubeSource'
import vtkConeSource from 'vtk.js/Sources/Filters/Sources/ConeSource'

class ItkVtkSegRendering extends Component {
  static propTypes = {
    fullScreenRenderer: PropTypes.object.isRequired
  }

  async componentDidMount(){
    var files = []
    for (let i = 0; i < 87; i++){
      let url = `${window.location.href}/../dicoms/${i}.dcm`
      let response = await fetch(url)
      let file = new File([await response.blob()], `${i}.dcm`)
      files.push(file)
    }
    const {image} = await readImageDICOMFileSeries(files)

    const itkImageData = vtkITKHelper.convertItkToVtkImage(image)

    //console.log(itkImageData)
    //console.log(itkImageData.getPointData().getScalars().getRange())
    //console.log(itkImageData.getDimensions())

    const renderer = this.props.fullScreenRenderer.getRenderer()
    const renderWindow = this.props.fullScreenRenderer.getRenderWindow()

    const actor = vtkActor.newInstance()
    const mapper = vtkMapper.newInstance()

    actor.setMapper(mapper)
    //actor.getProperty().setOpacity(0.05)

    const cube = vtkCubeSource.newInstance()
    const cone = vtkConeSource.newInstance()

    const cubeActor = vtkActor.newInstance()
    const coneActor = vtkActor.newInstance()

    const cubeMapper = vtkMapper.newInstance()
    const coneMapper = vtkMapper.newInstance()

    //console.log(cube)
    cube.setXLength(50)
    cube.setYLength(50)
    cube.setZLength(50)

    cubeActor.setMapper(cubeMapper)
    coneActor.setMapper(coneMapper)

    cubeMapper.setInputConnection(cube.getOutputPort())
    coneMapper.setInputConnection(cone.getOutputPort())

    cubeActor.getProperty().setColor(255, 0, 0)
    coneActor.getProperty().setColor(0, 0, 255)

    cubeActor.setPosition(20, 20, 20)
    coneActor.setPosition(-30, 20, -30)

    const marchingCubes = vtkImageMarchingCubes.newInstance({ contourValue: 125, computeNormals: false, mergePoints: true })

    marchingCubes.setInputData(itkImageData)
    mapper.setInputConnection(marchingCubes.getOutputPort())

    //renderer.addActor(actor)
    //renderer.addActor(cubeActor)
    //renderer.addActor(coneActor)

    renderer.resetCamera()
    //renderWindow.render()

  }

  render(){
    return (
      <div>
        <p>Hello!</p>
      </div>
    )
  }
}

export default ItkVtkSegRendering;
