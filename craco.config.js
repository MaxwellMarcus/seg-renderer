
const CracoItkPlugin = require("craco-itk")
const CracoVtkPlugin = require("craco-vtk")

var vtkRules = require('vtk.js/Utilities/config/dependency.js').webpack.core.rules;

module.exports = {
  plugins: [
    {
      plugin: CracoItkPlugin()
    },
    {
      plugin: CracoVtkPlugin()
    }
  ],
  webpack: {
    configure: {
        module: {
          rules: [
            {test: /\.html$/, loader: 'html-loader'}
          ]
      }
    }
  }
}
