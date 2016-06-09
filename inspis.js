var Twit = require("twit");
var fs = require("fs");
var request = require('request');
var express = require('express');
var gm = require('gm')
var app = express();

var dictionary = [];
dictionary = JSON.parse(fs.readFileSync("dictionary.json"));
dictionary.ruoat=[];
var data = JSON.parse(fs.readFileSync("data.json"));

var stories = [];
var texts = [];
var tweetText = "";

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

function workText(tekstirakenne)
{
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
        else if(tekstirakenne[i][0]=="§")
        {
            teksti+=generate();
        }
        else
        {
            teksti+=tekstirakenne[i];
        }
    }
   return teksti;
}

function generate()
{
    if(texts.length==0)
        texts=randomlistmany(data["lauseet"], data["lauseet"].length);
    
    return workText(texts.shift().toString().split("|"));
}



function createText()
{    
    var teksti = generate();
    var temp = teksti.split(' ');
    var valmis = [];
    var counter = 0;
    for(var i = 0; i< temp.length;i++)
    {
        counter+=temp[i].length;
        if(counter>10)
        {
            counter = 0;
            temp[i] = '\n' + temp[i];
        }
        valmis.push(temp[i]);
    }
    valmis[0][0] = valmis[0][0].toUpperCase();
    valmis.push('\n\t\t\t --Positiivisuutta--')
	return valmis.join(' ');
}

function makeStories()
{
    
    
    var a = randomlistmany(data["tarina0"], data["tarina0"].length);
    var b = randomlistmany(data["tarina1"], data["tarina1"].length);
    var c = randomlistmany(data["tarina2"], data["tarina2"].length);
    
    for(var i = 0; i<a.length;i++)
    {
        var tarina = "";
        tarina+=workText(a[i].toString().split("|")).split(". ").join(".\n");
        tarina+="\n\n";
        tarina+=workText(b[i].toString().split("|")).split(". ").join(".\n");
        tarina+="\n\n";
        tarina+=workText(c[i].toString().split("|")).split(". ").join(".\n");
        tarina+="\n\n";
        tarina+=workText(randomlist(data["tarina3"]).toString().split("|")).split(". ").join(".\n");
        tarina += "\n\t\t\t\tTarina vuodelta 19"+randomone(9).toString() + randomone(9).toString()+"\n\n--Positiivisuutta--"
        stories.push(tarina);
    }
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

function postImage(story)
{
    T.postMediaChunked({file_path: 'image.jpg'}, function(err, data, response) {
        if(data)
            {
                var mediaIdStr = data.media_id_string;
                var params = {status: "#positiivisuutta", media_ids: [mediaIdStr]};
                console.log(tweetText);
                T.post('statuses/update', params, function (err, data, response) {
                    getRandomImage(story)
                });
            }
        else
        console.log(err);
    });
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

function getImgContent (body, isHtml)
{
    if(isHtml)
        return body.split('<meta property="og:image" content="')[1].split('">')[0];
    else
        return body;
}

function getRandomImage(story)
{
    if (story)
        downloadImage("http://lorempixel.com/1000/800/", true);
    else
    {
        request("http://photo.net/photodb/random-photo?category=NoNudes", function(error, response, body){
        if(!error)
        {
            downloadImage(body.split('<meta property="og:image" content="')[1].split('">')[0], false)
        }
        }
        );
    }    
}

function downloadImage(url, story)
{
            request(url)
            .on('end', function(){
                tweetText = createText();
                var lines = tweetText.split('\n').length;
                var r = randomone(100),
                    g = randomone(100),
                    b = randomone(100);
                gm('image.png')
                    .size(function(err, value)
                    {
                        if(!err)
                        {
                            var textsize=Math.floor(value.width/20);
                            var textstart = value.height/lines;
                            var bright = 100;
                            var sat = 100;
                            imgtext=tweetText;
                            if(story)
                            {
                                bright=60;
                                sat=50;
                                textstart=40;
                                textsize=18;
                                imgtext=stories.shift();
                                if(stories.length==0)
                                    makeStories();
                            }
                                
                            gm('image.png')
                            .colorize(r, b, g)
                            .modulate(bright, sat)
                            .fontSize(textsize+"pt")
                            .font('LeckerliOne-Regular.ttf')
                            .fill('white')                
                            .drawText(40, textstart, imgtext)
                            
                            .write('image.jpg', function(err) {})
                        }
                        else
                        {
                            console.log(err);
                        }
                    }
                    )
            })
            .pipe(fs.createWriteStream('image.png'), function(err){"hippo"})

}

//seuraa käyttäjää

function follow(id)
{
	T.post("friendships/create", {user_id: id, follow: true}, function(err, data, response) {});
}

var morning = false;
var evening = false;
var temphour = 0;

function teejotain()
{
    var d = new Date();
    console.log(d.toLocaleTimeString());
    
    var h = d.getHours();
    var done = false;
  
    if (temphour!=h)
        {
            temphour=h;
            if(h==6&&!morning)
                {
                    postImage(true);
                    morning = true;
                    evening = false;
                    done = true;
                }
            if (h==18&&!evening)
            {
                postImage(true);
                morning=false;
                evening=true;
                done=true;
            }
            if(!done)
                postImage(false)
        }
    data = JSON.parse(fs.readFileSync("data.json"));
}

makeStories();

//toista 10 minuutin + 0-60s välein

setInterval(teejotain, 1000*60);
