var sql = require('mssql');
module.exports = function(router)
{

    router.get('/', function (req, res) {
        res.status(200).send("WORKING");
    });

    router.post('/api/Turn', function (req, res)
    {
        var Job =  "'" + req.body.Job + "'";
        var Action =  "'" + req.body.Action + "'";
        var sqlQuery = 'INSERT INTO Turns ([SurroundingAllyCount],[SurroundingOppositionCount],[TotalAllyCount],[TotalOppositionCount],[Job],[HealthPercent],[ManaPercent],[Move],[Action]) VALUES (' +
            req.body.SurroundingAllyCount + ', ' +
            req.body.SurroundingOppositionCount + ', ' +
            req.body.TotalAllyCount + ', ' +
            req.body.TotalOppositionCount + ', ' +
            Job + ', ' +
            req.body.HealthPercent + ', ' +
            req.body.ManaPercent + ', ' +
            req.body.Move + ', ' +
            Action + ')';


        var Connection = require('tedious').Connection;
        var config = {
            userName: 'danbendell',
            password: 'HVB37mdh',
            server: 'prco304-server.database.windows.net',
            // If you are on Microsoft Azure, you need this:
            options: {encrypt: true, database: 'PRCO304DB'}
        };
        var connection = new Connection(config);
        connection.on('connect', function(err) {
            // If no error, then good to proceed.
            console.log("Connected");

            var Request = require('tedious').Request;
            var TYPES = require('tedious').TYPES;

            var request = new Request("INSERT INTO Turns ([SurroundingAllyCount],[SurroundingOppositionCount],[TotalAllyCount],[TotalOppositionCount],[Job],[HealthPercent],[ManaPercent],[Move],[Action]) VALUES (@SurroundingAllyCount, @SurroundingOppositionCount, @TotalAllyCount, @TotalOppositionCount, @Job, @HealthPercent, @ManaPercent, @Move, @Action);", function(err) {
                if (err) {
                    console.log(err);}
            });
            request.addParameter('SurroundingAllyCount', TYPES.Int, req.body.SurroundingAllyCount);
            request.addParameter('SurroundingOppositionCount', TYPES.Int , req.body.SurroundingOppositionCount);
            request.addParameter('TotalAllyCount', TYPES.Int, req.body.TotalAllyCount);
            request.addParameter('TotalOppositionCount', TYPES.Int, req.body.TotalOppositionCount);
            request.addParameter('Job', TYPES.VarChar, req.body.Job);
            request.addParameter('HealthPercent', TYPES.Decimal, req.body.HealthPercent);
            request.addParameter('ManaPercent', TYPES.Decimal, req.body.ManaPercent);
            request.addParameter('Move', TYPES.Bit, req.body.Move);
            request.addParameter('Action', TYPES.VarChar, req.body.Action);

            request.addOutputParameter('ID', TYPES.Int);

            request.on('row', function(columns) {
                console.log("ROWWW");
                columns.forEach(function(column) {
                    if (column.value === null) {
                        console.log('NULL');
                    } else {
                        console.log("Product id of inserted item is " + column.value);
                    }
                });
            });

            request.on('returnValue', function(parameterName, value, metadata) {
                console.log(parameterName + ' = ' + value);      // number = 42
                res.status(200).send("DONE");                                              // string = qaz

            });

            request.on('done', function(rowCount, more, rows) {
               console.log("DONE");
            });
            connection.execSql(request);

        });

    });

    router.get('/api/Turn', function (req, res)
    {
        console.log(req.headers);
        var Job =  "'" + req.headers.job + "'";

        var sqlQuery =  'SELECT [SurroundingAllyCount] ' +
                        ',[SurroundingOppositionCount] ' +
                        ',[TotalAllyCount] ' +
                        ',[TotalOppositionCount] ' +
                        ',[Job] ' +
                        ',[HealthPercent] ' +
                        ',[ManaPercent] ' +
                        ',[Move] ' +
                        ',[Action] ' +
        'FROM Turns ' +
        'WHERE [SurroundingAllyCount] = ' + req.headers.surroundingallycount +
        ' AND [SurroundingOppositionCount] = ' + req.headers.surroundingoppositioncount +
        ' AND [TotalAllyCount] = ' + req.headers.totalallycount +
        ' AND [TotalOppositionCount] = ' + req.headers.totaloppositioncount +
        ' AND [Job] = ' + Job +
        ' AND [HealthPercent] = ' + req.headers.healthpercent +
        ' AND [ManaPercent] = ' +  req.headers.manapercent;


        var Connection = require('tedious').Connection;
        var config = {
            userName: 'danbendell',
            password: 'HVB37mdh',
            server: 'prco304-server.database.windows.net',
            // If you are on Microsoft Azure, you need this:
            options: {encrypt: true, database: 'PRCO304DB'}
        };
        var connection = new Connection(config);
        connection.on('connect', function(err) {
            // If no error, then good to proceed.
            console.log("Connected");

            var Request = require('tedious').Request;
            var TYPES = require('tedious').TYPES;

            var jsonArray = [];
            var rowObject ={};

            var request = new Request(sqlQuery, function(err, value, rows) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("value " + value);
                    console.log(rows);
                    res.status(200).send(jsonArray);
                }
            });
                var result = "";


                request.on('row', function(columns) {

                    columns.forEach(function(column) {
                        if (column.value === null) {
                            console.log('NULL');
                        } else {
                            rowObject[column.metadata.colName] = column.value;
                            result+= column.value + " ";
                        }
                    });
                    jsonArray.push(rowObject);
                    console.log(result);
                    result ="";
                });

                request.on('done', function(rowCount, more) {
                    //res.status(200).send("DONE");
                    console.log(rowCount + ' rows returned');
                });
                connection.execSql(request);
            });
        });


};