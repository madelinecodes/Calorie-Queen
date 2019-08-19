// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json({
    type: 'application/json'
}));
const friendlyWords = require('friendly-words');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function() {
    if (!exists) {
        db.run('CREATE TABLE Users (id INTEGER PRIMARY KEY, user TEXT, goal INTEGER)');
        console.log('New table Users created!');

        db.run('CREATE TABLE Meals (id INTEGER PRIMARY KEY, user TEXT, name TEXT, cals INTEGER, date INTEGER)');
        console.log('New table Meals created!');

        // insert default content
        db.serialize(function() {
            db.run('INSERT INTO Users (user, goal) VALUES ("test-key", 2000)');
            db.run('INSERT INTO Meals (user, name, cals, date) VALUES ("test-key", "Burger", 500, 1557004038929)');
        });
    } else {
        console.log('Database ready to go!');
        db.each('SELECT * from Users', function(err, row) {
            if (row) {
                console.log('record:', row);
            }
        });
        db.each('SELECT * from Meals', function(err, row) {
            if (row) {
                console.log('record:', row);
            }
        });
    }
});

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/views/index.html');
});

app.get('/dashboard/:user', function(request, response) {
    response.sendFile(__dirname + '/views/dashboard.html');
});

app.get('/demo/:user', function(request, response) {
    response.sendFile(__dirname + '/views/dashboard.html');
});

app.get('/api/get/:user', function(request, response) {
    db.all('SELECT * from Meals WHERE user = (?)', [request.params.user], function(err, rows) {
        if (err) {
            console.error(err);
            response.status(500);
            response.send('Server Error');
        } else {
            response.send(rows);
        }
    });
});

app.post('/api/add/:user', function(request, response) {
    const meal = {
        user: request.params.user,
        name: request.body.name,
        cals: request.body.cals,
        date: request.body.date
    }
    db.run("INSERT INTO Meals (user, name, cals, date) VALUES (?, ?, ?, ?)", [meal.user, meal.name, meal.cals, meal.date], function(err) {
        if (err) {
            console.error(err);
            response.status(500);
            response.send('Server Error');
        } else {
            response.status(200);
            response.send('OK');
        }
    });
});

app.post('/api/edit/:user', function(request, response) {
    const meal = {
        user: request.params.user,
        id: request.body.id,
        name: request.body.name,
        cals: request.body.cals
    }
    db.run("UPDATE Meals SET name = (?), cals = (?) WHERE id = (?) AND user = (?)", [meal.name, meal.cals, meal.id, meal.user], function(err) {
        if (err) {
            response.status(500);
            response.send('Server Error');
        } else {
            response.status(200);
            response.send('OK');
        }
    });
});

app.delete('/api/delete/:user', function(request, response) {
    const meal = {
        id: request.body.id,
        user: request.params.user
    }
    db.run("DELETE FROM Meals WHERE id = (?) AND user = (?)", [meal.id, meal.user], function(err) {
        if (err) {
            response.status(500);
            response.send('Server Error');
        } else {
            response.status(200);
            response.send('OK');
        }
    });
});

app.get('/api/register', function(request, response) {
    const rnd = () => {
        const pick = arr => arr[Math.floor(Math.random() * arr.length)];
        return `${pick(friendlyWords.predicates)}-${pick(friendlyWords.objects)}-${pick(friendlyWords.objects)}`;
    }
    const user = {
        user: rnd(),
        goal: 2000
    };
    db.run("INSERT INTO Users (user, goal) VALUES (?, ?)", [user.user, user.goal], function(err) {
        if (err) {
            response.status(500);
            response.send('Server Error');
        } else {
            response.status(200);
            response.send({
                user: user.user, //???
                goal: user.goal
            });
        }
    });
});

app.get('/api/info/:user', function(request, response) {
    db.all('SELECT * from Users WHERE user = (?)', [request.params.user], function(err, rows) {
        if (err) {
            console.error(err);
            response.status(500);
            response.send('Server Error');
        } else {
          console.log(rows[0]);
          response.send(rows[0]);
        }
    });
});

app.post('/api/change/:user', function(request, response) {
    const user = {
        user: request.params.user,
        goal: request.body.goal
    }
    db.run("UPDATE Users SET goal = (?) WHERE user = (?)", [user.goal, user.user], function(err) {
        if (err) {
            response.status(500);
            response.send('Server Error');
        } else {
            response.status(200);
            response.send('OK');
        }
    });
});

var listener = app.listen(process.env.PORT, function() {
    console.log('Your app is listening on port ' + listener.address().port);
});