const SASS = require('node-sass'); 

module.exports = function(code) 
{
    return SASS.renderSync({data: code}).css.toString();
}