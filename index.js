const autocompleteConfig = {
	renderOption(movie) {
		const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
		return `
			<img src = "${imgSrc}"/>
			${movie.Title} (${movie.Year})
        		`;
	},
	inputValue(movie) {
		return movie.Title;
	},
	async fetchData(searchTerm) {
		const response = await axios.get('http://www.omdbapi.com/', {
			params: {
				apikey: 'ff52cee5',
				//i: 'tt1285016'
				s: searchTerm
			}
		});
		if (response.data.Error) {
			return [];
		}
		return response.data.Search;
	}
};

createAutoComplete({
	...autocompleteConfig,
	root: document.querySelector('#left-autocomplete'),
	onOptionSelect(movie) {
		document.querySelector('.tutorial').classList.add('is-hidden');
		onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
	}
});
createAutoComplete({
	...autocompleteConfig,
	root: document.querySelector('#right-autocomplete'),
	onOptionSelect(movie) {
		document.querySelector('.tutorial').classList.add('is-hidden');
		onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
	}
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summarySide, side) => {
	const response = await axios.get('http://www.omdbapi.com/', {
		params: {
			apikey: 'ff52cee5',
			i: movie.imdbID
		}
	});

	summarySide.innerHTML = movieTempelate(response.data);
	if (side === 'left') {
		leftMovie = response.data;
	} else {
		rightMovie = response.data;
	}

	if (leftMovie && rightMovie) {
		runComparison();
	}
};
const runComparison = () => {
	const leftSideStats = document.querySelectorAll('#left-summary .notification');
	const rightSideStats = document.querySelectorAll('#right-summary .notification');

	leftSideStats.forEach((leftStat, index) => {
		const rightStat = rightSideStats[index];

		const leftSideValue = parseFloat(leftStat.dataset.value);
		const rightSideValue = parseFloat(rightStat.dataset.value);

		console.log(leftSideValue, rightSideValue);

		if (rightSideValue > leftSideValue) {
			leftStat.classList.remove('is-primary');
			leftStat.classList.add('is-warning');
			rightStat.classList.remove('is-warning');
			rightStat.classList.add('is-primary');
		} else if (rightSideValue === leftSideValue) {
			leftStat.classList.remove('is-primary');
			rightStat.classList.remove('is-primary');
			leftStat.classList.remove('is-warning');
			rightStat.classList.remove('is-warning');
		} else {
			rightStat.classList.remove('is-primary');
			rightStat.classList.add('is-warning');
			leftStat.classList.remove('is-warning');
			leftStat.classList.add('is-primary');
		}
	});
};
const movieTempelate = (movieDetail) => {
	const rottenTom = parseInt(movieDetail.Ratings[1].Value.replace(/\%/g, ''));
	const metaScore = parseInt(movieDetail.Metascore);
	const imdbRat = parseFloat(movieDetail.imdbRating);
	const votes = parseFloat(movieDetail.imdbVotes.replace(/,/g, ''));

	const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
		const value = parseInt(word);
		if (isNaN(value)) {
			return prev;
		} else {
			return prev + value;
		}
	}, 0);

	return `
    <article class="media">
    <figure class="media-left">
      <p class="image">
        <img src="${movieDetail.Poster}" />
      </p>
    </figure>
    <div class="media-content">
      <div class="content">
        <h1>${movieDetail.Title}</h1>
        <h4>${movieDetail.Genre}</h4>
        <p>${movieDetail.Plot}</p>
      </div>
    </div>
  </article>
  <article data-value="${awards}" class="notification is-primary">
      <p class="title"> ${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value="${rottenTom}" class="notification is-primary">
      <p class="title"> ${movieDetail.Ratings[1].Value}</p>
      <p class="subtitle">Rotten Tomatoes</p>
    </article>
    <article data-value="${metaScore}" class="notification is-primary">
      <p class="title"> ${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value="${imdbRat}" class="notification is-primary">
      <p class="title"> ${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value="${votes}" class="notification is-primary">
      <p class="title"> ${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
     
  `;
};
