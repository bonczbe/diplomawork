const mix = require("laravel-mix");

/* Compiling all the CSS and JS files into one file. */
mix.js("resources/js/app.js", "public/js")
    .react()
    .js("resources/js/supervisor.js", "public/js")
    .react()
    .postCss("resources/sass/app.css", "public/css", [require("tailwindcss")])
    .postCss("resources/sass/supervisor.css", "public/css", [require("tailwindcss")])
    .postCss("resources/sass/terms.css", "public/css", [require("tailwindcss")]);
