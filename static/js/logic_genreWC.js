let movieDataCloud = [];

function init() {
  d3.json('static/db/imdb_top_1000.json').then(data => {
    movieDataCloud = data; // Store the data in a global variable

    // Generate the word cloud on initial load
    generateWordCloud(data);  // Generate the word cloud once data is loaded
  }).catch(error => {
    console.error('Error loading the data:', error);
  });
}

// Function to generate the word cloud for genres
function generateWordCloud(data) {
    console.log("Generating word cloud...");
  
    // Extract genres from the movie data (handling multiple genres per movie)
    const genres = data.flatMap(movie => movie.Genre.split(',').map(d => d.trim())); // Split and clean up genres
  
    // Count the frequency of each genre
    const genreCounts = d3.rollup(genres, v => v.length, d => d);
  
    // Prepare the data for the word cloud
    const wordCloudData = Array.from(genreCounts, ([text, size]) => ({
      text,
      size: size * 10 // Adjust the size multiplier as needed
    }));
  
    // Set up the word cloud layout
    const width = 420;
    const height = 500;
  
    // Clear the existing word cloud before re-rendering
    const wordCloudContainer = document.getElementById("wordcloud");
    wordCloudContainer.innerHTML = "";
  
    // Set up the scale for font size
    const sizeScale = d3.scaleLinear()
        .domain([d3.min(wordCloudData, d => d.size), d3.max(wordCloudData, d => d.size)]) // Input range: smallest to largest size
        .range([10, 100]); // Output range: minimum and maximum font size in pixels
  
    // Ensure d3.layout.cloud is correctly called
    d3.layout.cloud()
      .size([width, height])
      .words(wordCloudData.map(d => ({ text: d.text, size: sizeScale(d.size) }))) // Apply the scaled size
      .padding(2) // Space between words
      .rotate(0)  // Set to 0 for horizontal words
      .font("Impact") // Choose your preferred font
      .fontSize(d => d.size) // Set word size based on frequency
      .on("end", draw) // Call the draw function after layout is computed
      .start();
  
    // Function to render the word cloud
    function draw(words) {
      const svg = d3.select("#wordcloud").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  
      svg.selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", d => d.size + "px") // Apply scaled font size
        .style("font-family", "Impact")
        .style("fill", "#ffc800") // Change word color to light yellow
        .attr("text-anchor", "middle")
        .attr("transform", d => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
        .text(d => d.text);
    }
}

// Initialize and populate the dropdown on page load
init();
