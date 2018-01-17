$(document).ready(() => {
    init();
});

let questionSet = [];
let questionIndex = 0;
let correctCount = 0;
let correctAnswer = '';
let timer = 0;
let timerHandle;
const timePerQuestion = 12;

let init = () => {
    const startInstructions = 'Click anywhere to start the game';
    displayInstructions(startInstructions);

    $(document).on('click', function() {
        startGame();
        removeInstructions();
        $(document).off();
    });
};

const startGame = () => {
    displayLoadAnimation();
    getTriviaQuestions();
};

const startNextRound = () => {
    resetTimer();
    updateTimer();
    clearHandlers();
    nextQuestion();
    timerHandle = setInterval(monitorRound, 1000);
};

const nextQuestion = () => {
    if (questionIndex < questionSet.length) {
        // get trivia question
        let questionObj = questionSet[questionIndex];
        let question = questionObj['question'];
        correctAnswer = questionObj['correct_answer'];
        let answerSet = questionObj['incorrect_answers'];

        // push the correct answer onto the set
        answerSet.push(correctAnswer);
        answerSet = shuffle(answerSet);

        displayQuestion(question, correctAnswer, answerSet);
        questionIndex++;
    } else {
        // no questions left; display results
        questionIndex = 0;
        showResults();
        setNextRoundListener();
    }
};

const displayQuestion = (question, correctAnswer, answerSet) => {
    let questionDiv = $('.panel__game-feature')

    let questionElem = $('<p>');
    questionElem.html(question);
    questionElem.addClass('panel__game-feature__question');

    // append question elem
    questionDiv.append(questionElem);

    // append answer elems
    answerSet.forEach((answer) => {
        let answerElem = $('<p>');
        answerElem.html(answer);
        answerElem.addClass('panel__game-feature__answer');
        answerElem.addClass('panel__game-feature__answer--grow');
        
        if (answer === correctAnswer) {
            answerElem.attr('data_correct', "");
        }

        // add click listeners
        let clickHandle = answerElem.on('click', function() {
            // increment correct guess count if answered correctly
            if ($(this).attr('data_correct')) {
                correctCount++
                removeQuestion();
                displayCorrectAnswerMsg();
            } else {
                removeQuestion();
                displayIncorrectAnswerMsg();
                resetTimer();
            }

            // stop/reset timer
            resetTimer();
            setNextRoundListener();
        });

        questionDiv.append(answerElem);
    });
};

const resetTimer = () => {
    // remove timer pulse
    removeTimerPulse();

    timer = timePerQuestion;
    clearInterval(timerHandle);
    updateTimer();
};

const updateTimer = () => {
    $('.panel__timer').text(timer--);
};

const clearQuestions = () => {
    $('.panel__game-feature__question', '.panel__game-feature__answer').html('');
};

const showResults = () => {
    let questionCount = questionSet.length;
    let score = correctCount / questionCount;

};

const clearHandlers = () => {
    let answers = $('.panel__game-feature__answer');
    for (let i = 0; i < answers.length; i ++) {
        answers[i].off();
    }
};

const shuffle = array => {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
};

const toggleLoadAnimation = () => {
    let loader = $('.panel__game-feature__loader');
    if (loader.css('visibility') == 'hidden') {
        loader.show();
    } else {
        loader.hide();
    }
};

const displayLoadAnimation = () => {
    let loader = $('<div>');
    loader.addClass('panel__game-feature__loader');

    $('.panel__game-feature').append(loader);
};

const removeLoadAnimation = () => {
    $('.panel__game-feature__loader').remove();
};

const getTriviaCallback = data => {
    if (data.response_code === 0) {
        questionSet = data.results;
    }
    // start a round once we have questions
    startNextRound();
};

const getTriviaQuestions = () => {
    const QUESTION_COUNT = 20;
    const DIFFICULTY = 'easy';
    const URL = `https://opentdb.com/api.php?amount=${QUESTION_COUNT}&category=11&difficulty=${DIFFICULTY}&type=multiple`;
    $.ajax({
        type: 'GET',
        url: URL,
        cache: false
    }).done((data) => {
        getTriviaCallback(data);
        //removeLoadAnimation();
    });
};

const setNextRoundListener = () => {
    resetTimer();
    $(document).on('click', function() {
        // remove anything in the game-feature section
        $('.panel__game-feature').html('');
        
        if (questionIndex < questionSet.length) {
            startNextRound();
        } else {
            startGame();
        }
        removeNextRoundListener();
    });
};

const removeNextRoundListener = () => {
    $(document).off();
};

const monitorRound = () => {
    updateTimer();

    if (timer < 6 && $('.panel__timer--pulse').length === 0) {
        $('.panel__timer').addClass('panel__timer--pulse');
    }

    if (timer === 0) {
        // remove question from div
        removeQuestion();

        // display out of time message
        displayTimeoutMsg();

        //  set next round listener to set next question on click
        setNextRoundListener();
    }
};

const displayTimeoutMsg = () => {
    let timeoutMsg = $(`<p>Out of time!</p><p>The correct answer is: ${correctAnswer}</p>`);
    timeoutMsg.addClass('panel__game-feature__timeout');
    $('.panel__game-feature').append(timeoutMsg);
};

const displayIncorrectAnswerMsg = () => {
    let incorrectMsg = $(`<p>That's incorrect!</p><p>The correct answer is: ${correctAnswer}</p>`);
    incorrectMsg.addClass('panel__game-feature__incorrect');
    $('.panel__game-feature').append(incorrectMsg);
};

const displayCorrectAnswerMsg = () => {
    let correctMsg = $(`<p>Ayyyeee! That's Correct!</p>`);
    correctMsg.addClass('panel__game-feature__correct');
    $('.panel__game-feature').append(correctMsg);
};

const displayInstructions = instruction => {
    let instructions = $('<p>');
    instructions.addClass('panel__game-feature__instructions');
    instructions.text(instruction);
    $('.panel__game-feature').append(instructions);
};

const removeQuestion = () => {
    $('.panel__game-feature__question', '.panel__game-feature__answer').remove();
};

const removeInstructions = () => {
    $('.panel__game-feature__instructions').remove();
};

const removeTimerPulse = () => {
    $('.panel__timer--pulse').removeClass('panel__timer--pulse');
};