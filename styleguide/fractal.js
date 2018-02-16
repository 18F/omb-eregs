'use strict';

const path = require('path');

const fractal = module.exports = require('@frctl/fractal').create();

fractal.set('project.title', 'OMB eRegs');

fractal.components.set('path', path.join(__dirname, 'components'));

fractal.components.engine('@frctl/nunjucks');
fractal.components.set('ext', '.html');
fractal.components.set('default.preview', '@preview');

fractal.docs.set('path', path.join(__dirname, 'docs'));

fractal.web.set('static.path', path.join(__dirname, 'public'));

// Theme
const mandelbrot = require('@frctl/mandelbrot');
const ombTheme = mandelbrot({
    "favicon": "/img/favicon/favicon.ico",
    "skin": "black",
    "nav": ["docs", "components"],
    "panels": ["notes", "html", "view", "context", "info"]
});

fractal.web.theme(ombTheme);
