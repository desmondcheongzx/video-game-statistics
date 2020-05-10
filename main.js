const NUM_ROWS = 10;

const MAX_WIDTH = 0.95 * Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 50, left: 220};

let game_graph_width = (MAX_WIDTH / 2) - 10, game_graph_height = 450;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

let tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

let game_svg = d3.select("#gamegraph")
    .append("svg")
    .attr("width", game_graph_width)
    .attr("height", game_graph_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let gameRef = game_svg.append("g");

let game_x = d3.scaleLinear()
    .range([0, game_graph_width - margin.left - margin.right]);

let game_y = d3.scaleBand()
    .range([0, game_graph_height - margin.top - margin.bottom])
    .padding(0.1);

let game_y_axis_label = game_svg.append("g");

game_svg.append("text")
    .attr("transform", `translate(${(game_graph_width - margin.left - margin.right)/2}, ${game_graph_height - margin.bottom})`)
    .style("text-anchor", "middle")
    .style("font-size", 18)
    .text("Global Sales (in millions)");

let game_y_axis_text = game_svg.append("text")
    .attr("transform", `rotate(-90) translate(${-(game_graph_height - margin.top - margin.bottom)/2}, ${-200})`)
    .style("text-anchor", "middle")
    .style("font-size", 18)
    .text("Name of Video Game");

let game_title = game_svg.append("text")
    .attr("transform", `translate(${(game_graph_width - margin.left - margin.right)/2}, ${-10})`)       
    .style("text-anchor", "middle")
    .style("font-size", 20);

let base_data;

d3.csv("video_games.csv").then((d) => {
    base_data = d;
    showAllYears();

    initMap();

    initPublishers();
});


function setGameYear(min_year, max_year, title) {
    let data = cleanDataByYear(base_data, numcomp('Year'), min_year, max_year);
    data.sort(numcomp('Rank'));
    data = data.splice(0, NUM_ROWS);

    game_x.domain([0, d3.max(data, d => parseFloat(d['Global_Sales']))]);
    game_y.domain(data.map(d => `${d['Name']} (${d['Platform']})`));
    game_y_axis_label.call(d3.axisLeft().scale(game_y));

    let gameColor = d3.scaleLinear()
        .domain([0, d3.max(data, d => parseFloat(d['Global_Sales']))])
        .range(['#cbc0fd', '#2905D4']);


    let bars = game_svg.selectAll("rect").data(data);

    bars.enter()
        .append("rect")
        .merge(bars)
        .transition()
        .duration(1000)
        .attr("x", game_x(0))
        .attr("y", d => game_y(`${d['Name']} (${d['Platform']})`))
        .attr("fill", d => gameColor(d['Global_Sales']))
        .attr("width", d => game_x(d['Global_Sales']))
        .attr("height", game_y.bandwidth());

    let sales = gameRef.selectAll("text").data(data);

    sales.enter()
        .append("text")
        .merge(sales)
        .transition()
        .duration(1000)
        .attr("x", d => game_x(d['Global_Sales']) + 5)
        .attr("y", d => game_y(`${d['Name']} (${d['Platform']})`) + 20)
        .style("text-anchor", "start")
        .text(d => d['Global_Sales']);

    game_title.text(`Top 10 Games ${title}`);

    bars.exit().remove();
    sales.exit().remove();
}

function cleanDataByYear(data, comp, min_year, max_year) {
    let filtered_data = data.filter(d => d['Year'] >= min_year && d['Year'] <= max_year);
    filtered_data.sort(comp);
    return filtered_data;
}

let year_selector = document.getElementById('year-selector');

for (let i = 2016; i >= 1980; i--) {
    year_selector.innerHTML += `<li><a onclick="setGameYear(${i}, ${i}, 'in ${i}');">${i}</a></li>`;
}

function showAllYears() {
    setGameYear(1980, 2020, `of All Time`);
}

/* Map Code */

/* Map data */
var map_svg = d3.select("#map");
let width_str = map_svg.style("width");
let map_width = parseInt(width_str.slice(0, width_str.length - 2)) - 50;
let height = map_svg.attr("height");

// Map and projection
let projection = d3.geoNaturalEarth()
    .scale(map_width / 1.5 / Math.PI)
    .translate([map_width / 2, height / 2])
    .precision(0.1);
let path = d3.geoPath()
    .projection(projection);

const maps = ['EU', 'NA', 'JP', 'Other'];

const regions = {
    'EU': d3.set(['BEL', 'CHE', 'DEU', 'AUT', 'ESP', 'FRA', 'ATF', 'GBR', 'GGY', 'JEY', 'FLK', 'SGS', 'GRC', 'MLT', 'IRL', 'ITA', 'LUX', 'NLD', 'AND', 'POL', 'PRT', 'TUR', 'CYP', 'CYN', 'MON', 'ALD', 'IMN', 'LTU', 'LVA', 'EST', 'BLR', 'UKR', 'MDA', 'ROU', 'HUN', 'SVK', 'SVN', 'HRV', 'BIH', 'CZE', 'BGR', 'KOS', 'MKD', 'ALB', 'MNE', 'SRB', 'DNK', 'FRO', 'FIN', 'GRL', 'ISL', 'NOR', 'SWE']),
    'NA': d3.set(['CAN', 'MEX', 'USA', 'BLZ', 'CRI', 'CUB', 'GTM', 'HND', 'NIC', 'PAN', 'SLV', 'HTI', 'JAM', 'DOM', 'PRI', 'BHS', 'TCA', 'ATG', 'DMA', 'BRB', 'GRD']),
    'JP': d3.set(['JPN']),
    'Other': d3.set(['BEL', 'CHE', 'DEU', 'AUT', 'ESP', 'FRA', 'ATF', 'GBR', 'GGY', 'JEY', 'FLK', 'SGS', 'GRC', 'MLT', 'IRL', 'ITA', 'LUX', 'NLD', 'AND', 'POL', 'PRT', 'TUR', 'CYP', 'CYN', 'MON', 'ALD', 'IMN', 'LTU', 'LVA', 'EST', 'BLR', 'UKR', 'MDA', 'ROU', 'HUN', 'SVK', 'SVN', 'HRV', 'BIH', 'CZE', 'BGR', 'KOS', 'MKD', 'ALB', 'MNE', 'SRB', 'DNK', 'FRO', 'FIN', 'GRL', 'ISL', 'NOR', 'SWE', 'CAN', 'MEX', 'USA', 'BLZ', 'CRI', 'CUB', 'GTM', 'HND', 'NIC', 'PAN', 'SLV', 'HTI', 'JAM', 'DOM', 'PRI', 'BHS', 'TCA', 'ATG', 'DMA', 'BRB', 'GRD', 'JPN'])
};

const region_col = {
    'EU': 'EU_Sales',
    'NA': 'NA_Sales',
    'JP': 'JP_Sales',
    'Other': 'Other_Sales'
};
const region_names = {
    'EU': 'Europe',
    'NA': 'North America',
    'JP': 'Japan',
    'Other': 'The Rest of the World',
    'All': 'The Whole World'
};

let genre_cats = new Set();
let genres = [];
let region_top = [];
let region_top_sales = [];
let myColor = d3.scaleOrdinal()
    .range(d3.schemeSet3);

const map_margin = {top: 40, right: 100, bottom: 50, left: 175};
const map_graph_height = game_graph_height;
const map_graph_width = game_graph_width;
let mgraph_svg = d3.select("#mapgraph")
    .append("svg")
    .attr("width", map_graph_width)
    .attr("height", map_graph_height)
    .append("g")
    .attr("transform", `translate(${map_margin.left}, ${map_margin.top})`);

let mapRef = mgraph_svg.append("g");

let map_x = d3.scaleLinear()
    .range([0, map_graph_width - map_margin.left - map_margin.right]);

let map_y = d3.scaleBand()
    .range([0, map_graph_height - map_margin.top - map_margin.bottom])
    .padding(0.1);

let map_y_axis_label = mgraph_svg.append("g")
    .style("font-size", 14);

let map_x_axis_text = mgraph_svg.append("text")
    .attr("transform", `translate(${(map_graph_width - map_margin.left - map_margin.right)/2}, ${map_graph_height - map_margin.bottom})`)
    .style("text-anchor", "middle")
    .style("font-size", 18)
    .text("Regional Sales (in millions)");

let map_y_axis_text = mgraph_svg.append("text")
    .attr("transform", `rotate(-90) translate(${-(map_graph_height - map_margin.top - map_margin.bottom)/2}, ${-120})`)
    .style("text-anchor", "middle")
    .style("font-size", 18)
    .text("Genre");

let map_title = mgraph_svg.append("text")
    .attr("transform", `translate(${(map_graph_width - map_margin.left - map_margin.right)/2}, ${-10})`)       
    .style("text-anchor", "middle")
    .style("font-size", 20);


function initMap() {
    let data = base_data.sort(comp('Genre'));

    maps.forEach(m => genres[m] = []);
    data.forEach((d) => {
        let genre = d['Genre'];
        genre_cats.add(genre);
        for (const [region, col] of Object.entries(region_col)) {
            const sales = parseFloat(d[col]);
            (genre in genres[region]) ?
                genres[region][genre] += sales : genres[region][genre] = sales;
        }
    });

    genre_cats = Array.from(genre_cats);
    myColor.domain(genre_cats);

    maps.forEach(region => {
        let sales = genres[region];
        region_top[region] = "";
        region_top_sales[region] = .0;
        genre_cats.forEach((genre) => {
            if (sales[genre] > region_top_sales[region]) {
                region_top_sales[region] = sales[genre];
                region_top[region] = genre;
            }
        });
    });

    d3.json("world.json").then((data) => {
        maps.forEach(region => {
            if (region == 'Other') {
                map_svg.append("path")
                    .datum(topojson.merge(data, data.objects.world.geometries.filter(d => !regions[region].has(d.id))))
                    .attr("fill", () => myColor(region_top[region]))
                    .attr("id", 'Other')
                    .attr("d", path);
                return;
            }
            map_svg.append("path")
                .datum(topojson.merge(data, data.objects.world.geometries.filter(d => regions[region].has(d.id))))
                .attr("fill", () => myColor(region_top[region]))
                .attr("stroke", "#555")
                .attr("id", `${region}`)
                .attr("d", path);
        });

        initInteractiveMap();
        initGenreSelector();
    });
}

function setMap(region) {
    let data = [];
    if (region == 'All') {
        maps.forEach(m => {
            let add_data = genres[m];
            for (const [genre, sales] of Object.entries(add_data)) {
                (genre in data) ? data[genre] += sales : data[genre] = sales;
            }
        });
    } else {
        data = genres[region];
    }
    let compiled = [];
    for (const [genre, sales] of Object.entries(data)) {
        compiled.push({'Genre': genre, 'Sales': sales});
    }
    compiled.sort(revnumcomp('Sales'));
    data = compiled;

    map_x.domain([0, d3.max(data, d => parseFloat(d['Sales']))]);
    map_y.domain(data.map(d => d['Genre']));
    map_y_axis_label.call(d3.axisLeft().scale(map_y));

    let bars = mgraph_svg.selectAll("rect").data(data);

    bars.enter()
        .append("rect")
        .on("click", d => setGenre(d['Genre']))
        .on("mouseover", d => {
            mgraph_svg.select(`#mgraph-${d['Genre']}`)
                .attr("fill", e => d3.rgb(myColor(d['Genre'])).darker(0.3));
        })
        .on("mouseout", d => {
            mgraph_svg.select(`#mgraph-${d['Genre']}`)
                .attr("fill", e => myColor(d['Genre']));
        })
        .merge(bars)
        .transition()
        .duration(1000)
        .attr("x", map_x(0))
        .attr("y", d =>  map_y(d['Genre']))
        .attr("width", d => map_x(d['Sales']))
        .attr("height", map_y.bandwidth())
        .attr("fill", d => myColor(d['Genre']))
        .style("cursor", "pointer")
        .attr("id", d => `mgraph-${d['Genre']}`);


    let sales = mapRef.selectAll("text").data(data);

    sales.enter()
        .append("text")
        .merge(sales)
        .transition()
        .duration(1000)
        .attr("x", d =>  map_x(d['Sales']) + 5)
        .attr("y", d => map_y(d['Genre']) + 17)
        .style("text-anchor", "start")
        .text(d => d['Sales'].toFixed(2));

    map_title.text(`Top Genres in ${region_names[region]}`);

    bars.exit().remove();
    sales.exit().remove();
}

function initInteractiveMap() {
    setMap('All');
    maps.forEach(m => {
        let map = document.getElementById(m);

        map.addEventListener('mouseenter', (e) => {
            setMap(m);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(region_names[m]+'<br />Top Genre: '+region_top[m]+'<br />Genre sales: '+region_top_sales[m].toFixed(2)+' million'); 
            
            map.classList.remove('translucent');
            maps.forEach(m2 => {
                if (m == m2) {
                    return;
                }
                let other_map = document.getElementById(m2);
                other_map.classList.add('translucent');
            });
        });
        map.addEventListener('mouseleave', (e) => {
            setMap('All');
            tooltip.transition()		
                .duration(400)		
                .style("opacity", 0);	

            maps.forEach(m2 => {
                let other_map = document.getElementById(m2);
                other_map.classList.remove('translucent');
            });
        });
    });
}

document.addEventListener('mousemove', (e) => {
    tooltip.style("left", (e.clientX + window.scrollX - 200) + "px")		
        .style("top", (e.clientY + window.scrollY - 60) + "px");	
});


/* Publisher code */
let publisher_svg = d3.select("#publishergraph")
    .append("svg")
    .attr("width", game_graph_width)
    .attr("height", game_graph_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let publisherRef = publisher_svg.append("g");

let publisher_x = d3.scaleLinear()
    .range([0, game_graph_width - margin.left - margin.right]);

let publisher_y = d3.scaleBand()
    .range([0, game_graph_height - margin.top - margin.bottom])
    .padding(0.1);

let publisher_y_axis_label = publisher_svg.append("g");

let publisher_x_axis_text = publisher_svg.append("text")
    .attr("transform", `translate(${(game_graph_width - margin.left - margin.right)/2}, ${game_graph_height - margin.bottom})`)
    .style("text-anchor", "middle")
    .text("Global Sales (in millions)")
    .style("font-size", 18);

let publisher_y_axis_text = publisher_svg.append("text")
    .attr("transform", `rotate(-90) translate(${-(game_graph_height - margin.top - margin.bottom)/2}, ${-200})`)
    .style("text-anchor", "middle")
    .style("font-size", 18)
    .text("Publisher");

let publisher_title = publisher_svg.append("text")
    .attr("transform", `translate(${(game_graph_width - margin.left - margin.right)/2}, ${-10})`)       
    .style("text-anchor", "middle")
    .style("font-size", 20);

let genre_pub = [];
let genre_pub_count = [];


function initPublishers() {
    let data = base_data.sort(comp('Genre'));

    data.forEach(d => {
        let genre = d['Genre'];
        let pub = d['Publisher'];
        let sales = parseFloat(d['Global_Sales']);
        if (!(genre in genre_pub)) {
            genre_pub[genre] = [];
            genre_pub_count[genre] = [];
        }
        if (pub in genre_pub[genre]) {
            genre_pub[genre][pub] += sales;
            genre_pub_count[genre][pub] += 1;
        } else {
            genre_pub[genre][pub] = sales;
            genre_pub_count[genre][pub] = 1;
        }
    });

    setGenre('Action');
}

let metric = 'Sales';
let cur_genre = 'Action';

const publisher_metrics = {
    'Sales': "Global Sales (in millions)",
    'Average': "Average Sales Per Game (in millions)"
};

function setGenre(genre) {
    cur_genre = genre;
    let data = genre_pub[genre];
    let compiled = [];
    for (const [pub, sales] of Object.entries(data)) {
        if (sales <= 0) {
            continue;
        }
        let avg = sales / genre_pub_count[genre][pub];
        compiled.push({'Publisher': pub, 'Sales': sales, 'Average': avg});
    }
    compiled.sort(revnumcomp(metric));
    data = compiled.splice(0, NUM_ROWS);

    publisher_x.domain([0, d3.max(data, (d) => parseFloat(d[metric]))]);
    publisher_y.domain(data.map(d => d['Publisher']));
    publisher_y_axis_label.call(d3.axisLeft().scale(publisher_y));

    let bars = publisher_svg.selectAll("rect").data(data);

    let basecolor = d3.hsl(myColor(genre));
    basecolor = basecolor.darker(1);

    let genreColor = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => parseFloat(d[metric]))])
        .range([basecolor.brighter(1), basecolor.darker(0.5)]);
    
    bars.enter()
        .append("rect")
        .merge(bars)
        .transition()
        .duration(1000)
        .attr("x", publisher_x(0))
        .attr("y", d => publisher_y(d['Publisher']))
        .attr("width", d => publisher_x(d[metric]))
        .attr("fill", d => genreColor(d[metric]))
        .attr("height", publisher_y.bandwidth());

    let sales = publisherRef.selectAll("text").data(data);

    sales.enter()
        .append("text")
        .merge(sales)
        .transition()
        .duration(1000)
        .attr("x", d => publisher_x(d[metric]) + 5)
        .attr("y", d => publisher_y(d['Publisher']) + 20)
        .style("text-anchor", "start")
        .text(d => d[metric].toFixed(2));

    publisher_title.text(`Top 10 Publishers in ${genre} Games`);
    publisher_x_axis_text.text(publisher_metrics[metric]);

    bars.exit().remove();
    sales.exit().remove();
}

function setMetric(m) {
    metric = m;
    setGenre(cur_genre);
}

function initGenreSelector() {
    let genre_selector = document.getElementById('genre-selector');
    genre_cats.forEach(genre => {
        genre_selector.innerHTML += `<li><a onclick="setGenre('${genre}');">${genre}</a></li>`;
    });
}


/* Helper functions */
function revnumcomp(attr) {
    return (a, b) => {
        a_val = parseFloat(a[attr]);
        b_val = parseFloat(b[attr]);
        return (a_val > b_val ? -1 : 1);
    };
}

function numcomp(attr) {
    return (a, b) => {
        a_val = parseFloat(a[attr]);
        b_val = parseFloat(b[attr]);
        return (a_val < b_val ? -1 : 1);
    };
}

function comp(attr) {
    return (a, b) => {
        return (a[attr] < b[attr] ? -1 : 1);
    };
}
