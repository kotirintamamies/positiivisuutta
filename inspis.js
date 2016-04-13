var Twit = require("twit");
var fs = require("fs");
var request = require('request');
var express = require('express');
var app = express();

var dictionary = [];
dictionary = JSON.parse(fs.readFileSync("dictionary.json"));
dictionary.ruoat=[];
var data = JSON.parse(fs.readFileSync("data.json"));


//serveri
app.get("/", function (req, res) {
  res.send(
  "<html><head></head><body><h1>" +
    data.Name+ 
  "</h1><p>Running hours:" + log.runningHours + "<h2>log:</h2><ul><li>" + log.events.join("</li><li>")
  + "</li></ul></body></html>"
  );
});

//serveri käynnistyy
app.listen(8080, function () {
  console.log("Inspis initialized");
});

//loki web-serveritsekkausta varten
var log = 
{
    runningHours: 0,
    events: [],
    add: function(text)
    {
        this.events.push(text);
        if (this.events.length>50)
            this.events.shift();
    }
}

setInterval(function(){log.runningHours++;}, 1000*60*60)

//twitter-tiedot

var T = new Twit({
  consumer_key:         "", 
  consumer_secret:      "",
  access_token:         "",
  access_token_secret:  ""
});



get("https://fi.wiktionary.org/w/api.php?action=query&format=json&list=categorymembers&cmlimit=5000&cmtitle=Luokka%3A+","Suomen_kielen_ruoat", "ruoat")

//Tämä jos haluat aloittaa alusta tai tehdä jonkin muunlaisen systeemin
/*createDictionary();

function createDictionary()
{
    var aakkoset = "abcdefghijklmnopqrstuvwxyzåäö";
    for(var i = 0; i<aakkoset.length;i++)
    {
        get("https://fi.wiktionary.org/w/api.php?action=query&format=json&list=categorymembers&cmlimit=5000&cmtitle=Luokka%3A+", "Suomen_kielen_verbit-" + aakkoset[i], "verbit");
        get("https://fi.wiktionary.org/w/api.php?action=query&format=json&list=categorymembers&cmlimit=5000&cmtitle=Luokka%3A+", "Suomen_kielen_substantiivit-" + aakkoset[i], "substantiivit");
        get("https://fi.wiktionary.org/w/api.php?action=query&format=json&list=categorymembers&cmlimit=5000&cmtitle=Luokka%3A+", "Suomen_kielen_adjektiivit-" + aakkoset[i], "adjektiivit");
    }
setTimeout(function(){ console.log("tallentaa"); fs.writeFile('dictionary.json', JSON.stringify(dictionary), function (err){}); }, 120000);
}*/

//hakee wictionarysta ja looppaa jos kategoria

function get(url, param, to)
{
request(url+param, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var obj = JSON.parse(body);
    var ret = [];
    obj.query.categorymembers.forEach(function(entry) 
        {
            
            if(entry.title.split(':').length==2)
                get(url, entry.title.split(':')[1], to);
            else if (entry.title)
                dictionary[to].push(entry.title);
        }
    )
  }
})
}


//tekstinluomisfunktiot

function createText()
{    
 
  	var tekstirakenne = randomlist(data["lauseet"]).toString().split("|");
	var teksti = "";
	for(var i =0;i<tekstirakenne.length;i++)
    {
        if(tekstirakenne[i][0]=="£")
        {
            teksti+=randomlist(data[tekstirakenne[i].substring(1)]);
        }
        else if(tekstirakenne[i][0]=="½")
        {
            teksti+=randomlist(dictionary[tekstirakenne[i].substring(1)]);
        }
        else
        {
            teksti+=tekstirakenne[i];
        }
    }
    
	return teksti;
}

//perusfunktiot, satunnaisuus

function randomlist(arr)
{
    if(arr)
	return (arr[Math.floor((Math.random()*arr.length))]);
    else
    return null	
}

function randomlistmany(arr, amount)
{
    var ret = [];
    if(arr)
    {
        for(var i = amount; i>0;i--)
        {
           ret.push(arr.splice(Math.floor((Math.random()*arr.length)), 1));    
        }
    }
    return ret;
}

function randomzero(amount)
{
    return Math.floor(Math.random()*amount);
}
function randomone(amount)
{
    return Math.floor(Math.random()*amount)+1;
}

//tykkäys

function like(id)
{
	T.post("favorites/create", {id: id.toString()}, function(err, data, response) {});
}

//postaus

function post (text)
{
    log.add("tweeted: " + text);
    T.post("statuses/update", {status: text}, function(err,data,response){})
}
function resepti ()
{
    var recipe = "Smoothie!";
    recipe+=" #"+(randomlistmany(data.superfoodit, randomone(3))).join(" #");
   
    recipe+=" "+(randomlistmany(dictionary.ruoat, randomone(2))).join(" ");
    
    recipe+=" "+(randomlistmany(data.kasvikset, randomone(3))).join(" ");
    
    recipe+=" "+(randomlistmany(data.nesteet, 1)).join(" ");
    log.add(recipe);
    post(recipe);
}

//seuraa käyttäjää

function follow(id)
{
	T.post("friendships/create", {user_id: id, follow: true}, function(err, data, response) {});
}

function teejotain()
{
  console.log("ajastettu funktio käynnistetty");

    data = JSON.parse(fs.readFileSync("data.json"));
    var rand = randomone(data.BigChance);
    switch (rand)
        {
            case 1:
                post(createText())
            break;
            case 2:
                resepti()
            default:
            break;
        }
}

//toista 10 minuutin + 0-60s välein

setInterval(teejotain, 1000*60*10+randomone(60000));
