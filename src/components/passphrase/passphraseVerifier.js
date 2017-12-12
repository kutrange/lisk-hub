import React from 'react';
import fillWordsList from 'bitcore-mnemonic/lib/words/english';
import styles from './passphrase.css';
import { PrimaryButton } from '../toolbox/buttons/button';
import circle from '../../assets/images/circle.svg';
import { extractAddress } from '../../utils/api/account';

class PassphraseValidator extends React.Component {
  constructor() {
    super();
    this.state = {
      step: 'verify',
      numberOfOptions: 3,
      words: [],
      missing: [],
      answers: [],
      formValidity: true,
    };
  }

  componentDidMount() {
    // this.props.randomIndex is used in unit teasing
    this.hideRandomWord.call(this);
    this.address = this.getAddress();
  }

  componentDidUpdate() {
    if (this.state.formValidity && this.state.answers.length === this.state.missing.length) {
      this.next();
    }
  }

  onWordSelected(e) {
    const index = e.nativeEvent.target.getAttribute('answer');
    const answers = [...this.state.answers];
    answers[index] = {
      value: e.nativeEvent.target.value,
      validity: e.nativeEvent.target.value === this.state.words[this.state.missing[index]],
    };

    const formValidity = this.formValidator(answers);
    this.setState({ answers, formValidity });
  }

  // eslint-disable-next-line  class-methods-use-this
  formValidator(answers) {
    return answers.reduce((isValid, answer) =>
      isValid && answer.validity, true);
  }

  next() {
    this.setState({ step: 'done' });
  }

  hideRandomWord() {
    const words = this.props.passphrase.match(/\w+/g);
    const indexByRand = num => Math.floor(num * (words.length - 1));

    /**
     * Returns a random index which doesn't exist in list
     * 
     * @param {Array} list - The list of existing random Indexes
     * @returns {Number} random index between 0 and length of words
     */
    const randomIndex = (list) => {
      let index;
      do {
        index = indexByRand(Math.random());
      }
      while (list.includes(index));
      return index;
    };

    /**
     * Returns a number of random indexes within 0 and the length of words
     * @param {Number} qty - the number of random indexes required
     * @returns {Array} the list of random indexes
     */
    const chooseRandomWords = (qty) => {
      const missing = [];

      for (let i = 0; i < qty; i++) {
        missing.push(randomIndex(missing));
      }

      return missing.sort((a, b) => a > b);
    };

    const missing = chooseRandomWords(2);
    const wordOptions = this.assembleWordOptions(words, missing);

    this.setState({
      words,
      missing,
      wordOptions,
    });
  }

  assembleWordOptions(passphraseWords, missingWords) {
    const getRandomWord = () => {
      let rand;

      do {
        rand = Math.floor(Math.random() * 2048);
      }
      while (passphraseWords.includes(fillWordsList[rand]));

      return fillWordsList[rand];
    };

    const mixWithMissingWords = (options) => {
      options.forEach((list, listIndex) => {
        const rand = Math.floor(Math.random() * list.length);
        list[rand] = passphraseWords[missingWords[listIndex]];
      });

      return options;
    };

    const wordOptions = [];
    for (let i = 0; i < missingWords.length; i++) {
      wordOptions[i] = [];
      for (let j = 0; j < this.state.numberOfOptions; j++) {
        wordOptions[i][j] = getRandomWord();
      }
    }

    return mixWithMissingWords(wordOptions);
  }

  changeHandler(answer) {
    this.setState({ answer });
  }

  // eslint-disable-next-line  class-methods-use-this
  focus({ nativeEvent }) {
    nativeEvent.target.focus();
  }

  getAddress() {
    return extractAddress(this.props.passphrase);
  }

  render() {
    let missingWordIndex = -1;
    return (
      <section className={`passphrase-verifier ${styles.verifier} ${styles[this.state.step]}`}>
        <header className={styles.table}>
          <div className={styles.tableCell}>
            <h2 className={styles.verify}>Choose the correct phrases to confirm.</h2>
            <h2 className={styles.done}>Awesome!<br />You’re all set.</h2>
            {
              !this.state.formValidity ?
                <h5 className={styles.verify}>Please go back and check your passphrase again.</h5>
                : null
            }
          </div>
        </header>
        <section className={`${styles.table} ${styles.verify}`}>
          <div className={styles.tableCell}>
            <form className={`passphrase-holder ${styles.passphrase}`}>
              {
                this.state.wordOptions ?
                  this.state.words.map((word, index) => {
                    if (!this.state.missing.includes(index)) {
                      return (<span key={word} className={styles.word}>{word}</span>);
                    }
                    missingWordIndex++;
                    return (
                      <fieldset key={word}>
                        {
                          this.state.wordOptions[missingWordIndex].map(wd =>
                            <div key={wd}>
                              <input
                                name={`answer${missingWordIndex}`}
                                answer={missingWordIndex}
                                type='radio' value={wd}
                                id={wd}
                                onChange={this.onWordSelected.bind(this)} />
                              <label htmlFor={wd}>{wd}</label>
                            </div>)
                        }
                      </fieldset>
                    );
                  }) : null
              }
            </form>
          </div>
        </section>
        <section className={`${styles.table} ${styles.done}`}>
          <div className={styles.tableCell}>
            <figure>
              <img src={circle} alt='Address avatar' />
            </figure>
            <h4 className={styles.address}>{this.address}</h4>
            <PrimaryButton
              theme={styles}
              label='Get to your Dashboard'
              className="next-button"
              onClick={() => this.props.finalCallback({ passphrase: this.state.words.join(' ') })}
            />
          </div>
        </section>
      </section>
    );
  }
}

export default PassphraseValidator;
