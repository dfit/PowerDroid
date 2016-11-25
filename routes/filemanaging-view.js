var express = require('express');
var router = express.Router();
var pg = require("pg");
var fs = require('file-system');
var path = require('path');
var mime = require('mime');
var exec = require('child_process').exec, child;


/* GET filemanaging view page. */
router.get('/', function(req, res, next) {
    var client = new pg.Client(req.app.get('connexion'));
    client.connect();

    var query = client.query("SELECT * FROM file_table WHERE idUser='"+global.id+"'");
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        console.log(JSON.stringify(result.rows, null, "    "));
        client.end();
        res.render('filemanaging-view', { rows: result.rows});
    });
});

router.get('/dll',function(req,res, next) {
    var client = new pg.Client(req.app.get('connexion'));
    client.connect();
    client.query("SELECT * FROM file_table WHERE id='"+req.query.id+"'",
        function(err, readResult) {
            console.log('err',err,'pg readResult',readResult);
            var fileName = req.query.scope == "apk" ? readResult.rows[0].filenameapk : req.query.scope == "apkTest" ? readResult.rows[0].filenameapktest : readResult.rows[0].filenamemanifest;
            var dataFile = req.query.scope == "apk" ? readResult.rows[0].dataapk : req.query.scope == "apkTest" ? readResult.rows[0].dataapktest : readResult.rows[0].filenameapktest;

            fs.writeFile('./uploads/'+fileName, dataFile);

            var file = './uploads/'+fileName;

            var filename = path.basename(file);
            var mimetype = mime.lookup(file);

            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
            res.setHeader('Content-type', mimetype);

            var filestream = fs.createReadStream(file);
            filestream.pipe(res);
            fs.unlink("./uploads/"+fileName);
        });
});

router.get('/del',function(req,res,next) {
    var client = new pg.Client(req.app.get('connexion'));
    client.connect();
    client.query("DELETE FROM file_table WHERE id='"+req.query.id+"'",
        function(err, readResult) {
            console.log('err',err,'pg readResult',readResult);
            res.redirect("/filemanaging-view");
        });
});

router.get('/script',function(req,res,next) {
    //TODO : Modifier l'adresse pour la release
    child = exec('adb',{cwd: 'C:\\Users\\David\\AppData\\Local\\Android\\android-sdk\\platform-tools'},
        function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
});

module.exports = router;