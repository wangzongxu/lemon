module.exports = {
  entry:['main.js','style.css'],
  output:'dist/[name].js',
  module:{
    rule:[
      {
        test:/\.css$/,
        loader:'css-loader'
      }
    ]
  }
}
