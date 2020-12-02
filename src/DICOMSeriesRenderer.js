import React, { Component } from 'react'
import PropTypes from 'prop-types'

import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor'
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper'
import vtkImageData from 'vtk.js/Sources/Common/DataModel/ImageData'
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray'
import vtkImageMarchingCubes from 'vtk.js/Sources/Filters/General/ImageMarchingCubes'

import * as cornerstone from 'cornerstone-core'
import * as dicomParser from 'dicom-parser'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'

import dcmjs from 'dcmjs'

cornerstoneWADOImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.dicomParser = dicomParser

let metaData = {}

function metaDataProvider(type, imageId){
  if (!metaData[imageId]){
    return
  }

  return metaData[imageId][type]
}

function addMetaData(type, imageId, data){
  metaData[imageId] = metaData[imageId] || {}
  metaData[imageId][type] = data
}

cornerstone.metaData.addProvider(metaDataProvider)

async function getSegImageData(images, seg){
  const imageIds = images.map(image => {return image.imageId})
  const {labelmapBuffer} = dcmjs.adapters.Cornerstone.Segmentation.generateToolState(imageIds, seg, {get: cornerstoneWADOImageLoader.wadouri.metaData.metaDataProvider})

  const pixelData = new Uint16Array(labelmapBuffer)

  const width = images[0].width
  const height = images[0].height
  const depth = images.length

  const spacingXZ = images[0].data.string('x00280030')
  const spacingX = spacingXZ.split('\\')[0]
  const spacingZ = spacingXZ.split('\\')[1]
  const spacingY = images[0].data.string('x00180050')

  const dataArray = vtkDataArray.newInstance({values: pixelData})

  const imageData = vtkImageData.newInstance()
  imageData.getPointData().setScalars(dataArray)
  imageData.setDimensions([width, height, depth])
  imageData.setSpacing(Number(spacingX), Number(spacingZ), Number(spacingY))

  return imageData
}

async function getImageData(imageIds){
  const images = []
  const dataSet = []
  for (let i = 0; i < imageIds.length; i++){
    const file = await fetch(imageIds[i])
    const blob = await file.blob()
    const id = await cornerstoneWADOImageLoader.wadouri.fileManager.add(blob)
    const image = await cornerstone.loadAndCacheImage(id)
    images.push(image)
  }

  images.sort((a, b) => {
    const spotA = Number(a.data.string('x00201041'))
    const spotB = Number(b.data.string('x00201041'))

    return spotA - spotB
  })

  const metaData = {get: cornerstoneWADOImageLoader.wadouri.metaData.metaDataProvider}

  const width = images[0].width
  const height = images[0].height
  const depth = images.length

  const spacingXZ = images[0].data.string('x00280030')
  const spacingX = spacingXZ.split('\\')[0]
  const spacingZ = spacingXZ.split('\\')[1]
  const spacingY = images[0].data.string('x00180050')

  var pixelDatas = images.map(image => {return image.getPixelData()})
  var pixelData = []
  pixelDatas.map(data => {pixelData = pixelData.concat([...data])})
  var pixelData = new Uint16Array(pixelData)

  const dataArray = vtkDataArray.newInstance({
    values: pixelData
  })
  const imageData = vtkImageData.newInstance()
  imageData.getPointData().setScalars(dataArray)
  imageData.setDimensions([width, height, depth])
  imageData.setSpacing(Number(spacingX), Number(spacingZ), Number(spacingY))

  return {imageData, images: images}
}

async function DICOMSeriesRenderer(fullScreenRenderer){
    const uris = []
    for (let i = 0; i < 87; i++){
      uris.push(`${window.location.href}/../dicoms/${i}.dcm`)
    }

    const {imageData, images} = await getImageData(uris)

    const renderer = fullScreenRenderer.getRenderer()
    const renderWindow = fullScreenRenderer.getRenderWindow()

    const actor = vtkActor.newInstance()
    const mapper = vtkMapper.newInstance()

    mapper.setColorModeToDirectScalars();
    mapper.setScalarModeToUsePointFieldData();

    actor.setMapper(mapper)
    actor.getProperty().setOpacity(0.15)
    actor.getProperty().setEdgeColor(0, 0, 0)
    //actor.setForceTranslucent(true)

    const marchingCubes = vtkImageMarchingCubes.newInstance({ contourValue: 125, computeNormals: false, mergePoints: false })
    marchingCubes.setInputData(imageData)

    mapper.setInputConnection(marchingCubes.getOutputPort())

    renderer.addActor(actor)
    renderer.resetCamera()
    renderWindow.render()

    return {actor, marchingCubes}

}

export default DICOMSeriesRenderer
