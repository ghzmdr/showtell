var express = require('express')
var handlebars = require('handlebars')
var fs = require('fs')

var slides = require('./slides.json')
var app = express()

var head = fs.readFileSync('./templates/head.hbs', 'utf8')
var foot = fs.readFileSync('./templates/foot.hbs', 'utf8')
var headTemplate = handlebars.compile(head)
var footTemplate = handlebars.compile(foot)

app.use(express.static('static'))

app.use('/scripts', express.static('scripts'))
app.use('/slides.json', express.static('slides.json'))
app.use('/manifest.json', express.static('manifest.json'))

app.get('/', function (req, res) {
    res.status(200).send(renderSlide(findSlideByField('slug', 'home')))
})

app.get('/pages/:slug', function (req, res) {
    var slide = findSlideByField('slug', req.params.slug)
    if (!slide) {
        res.status(404).send('Not Found')
        return
    }

    res.status(200).send(renderSlide(slide))
})

function renderSlide(slide) {
    var file = fs.readFileSync('./pages/' + slide.slug + '.html', 'utf8')
    var foot = fs.readFileSync('./templates/foot.hbs', 'utf8')

    var data = {
        title: slide.name,
        pageNumber: slide.orderNumber,
        totalPages: slides.length -1
    }

    if (slide.orderNumber > 0) {
        if (slide.orderNumber === 1) {
            data.prevPage = '/'    
        } else {
            data.prevPage = '/pages/' + slides[slide.orderNumber -1].slug
        }
    } else {
        data.prevPage = ''
    }

    if (slide.orderNumber < slides.length -1) {
        data.nextPage = '/pages/' + slides[slide.orderNumber +1].slug
    } else {
        data.nextPage = ''
    }

    console.log(data)

    return headTemplate(data) + file + footTemplate(data)
}

function findSlideByField(field, match) {
    var slide = null

    for (var si = 0; si < slides.length; ++si) {
        if (slides[si][field] === match) {
            slide = slides[si]
            slide.orderNumber = si
            break
        }
    }

    return slide
}

app.listen(5000)