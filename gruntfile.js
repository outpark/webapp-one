module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        pylint : {
            options : {
                rcfile     : './.pylintrc'
            },
            app     : {
                src : [
                    './*.py',
                    'main/*.py',
                    'main/api/**/*.py',
                    'main/auth/**/*.py',
                    'main/control/**/*.py',
                    'main/model/**/*.py'
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-pylint');
    grunt.registerTask('default', ['pylint']);
};