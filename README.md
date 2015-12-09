# Webapp-ONE
First iteration of the Hack NYU platform
http://hack-nyu.appspot.com

##Pre-reqs
* Python
* pip
* git
* Npm (Nodejs)
* [Google App Engine SDK for Python](https://cloud.google.com/appengine/downloads?hl=en)
* IDE - my preference is [PyCharm Ultimate Edition](https://www.jetbrains.com/pycharm/download/)
  * [nyu.edu email will get you free subscription](https://www.jetbrains.com/student/)

##Installation: Mac/Linux and Windows
1. Make sure you have python installed
2. Install pip, git and npm
3. Clone with git: https://github.com/hacknyu2016/webapp-one or git@github.com:hacknyu2016/webapp-one.git
4. Setup flask requirements - in the root folder run:
  * Mac/Linux: ```python setup.py```
  * Windows: 
     - Make a directory in ./main called pylibs
     - run the following in the ./main folder: ```pip install -t ./pylibs -r ./../requirements.txt```
5. Install node modules: ```npm install```
6. Install bower components: ```bower install```
7. Run Gulp to enable livereload and css generation from .less: ```gulp```
8. Run app engine server: You can do this from within PyCharm:
  * Run > Edit Configurations... > Add (+): App Engine Server as a configuration
  * Set the working directory as ./main
  * Fix the path to the Google App Engine SDK you downloaded earlier
    - On Mac: /usr/local/google_appengine
    - On Linux: wherever you extracted the .tar.gz
  * Run your new configuration
Note: You can also run from the terminal by running dev_appserver.py '/address-to-project-dir/main'
  * dev_appserver.py is found in google_appengine folder

##Installation: Windows
Follow steps 1-4 from Mac/Linux installation

##Contributing to the Project
1. After you have cloned the git and set up the environment, create a new branch for the feature/fix you are working on: ``` git checkout -b feature-projects```
2. Add your features and push your branch frequently
  1. git add .
  2. git commit -m 'e.g. Added templates'
  3. git push -u origin feature-projects  
3. When you are ready to merge into the master branch
  1. git pull (you may have to fix conflicts)
  2. git add .
  3. git commit -m 'Name of your commit - e.g. Added feature-projects'
  4. git push -u origin master

###Tips
* To add scripts for components edit the gulpfile scripts array as gulp injects-scripts upon running
Lots more to come...