Bathymetry Data Viewer
======================

Tasks
---------------

gulp  
copy required files to /dist; generate eslint report; starts server on localhost:3000. run Intern tests at http://localhost:3000/node_modules/intern/client.html?config=tests/intern

gulp --environment production  
similar to above but w/o the files to run Intern and strips out the console statements

gulp clean  
removes the dist, zip directories

gulp package  
produces a zip file suitable for deployment

gulp package --environment development  
similar to above but zip file also contains files needed to run Intern tests


Setup
-----
* install yarn
* npm install -g gulp-cli, bower
* npm install gulp -D
* yarn install
