
const CracoItkPlugin = require("craco-itk")
const CracoVtkPlugin = require("craco-vtk")

module.exports = {
  plugins: [
    {
      plugin: CracoItkPlugin()
    },
    {
      plugin: CracoVtkPlugin()
    }
  ]
}
