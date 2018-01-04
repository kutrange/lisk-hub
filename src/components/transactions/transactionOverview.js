import React from 'react';
import CopyToClipboard from '../copyToClipboard';
import TransactionList from './transactionList';
import LiskAmount from '../liskAmount';
import Box from '../box';
import styles from './transactions.css';

class Transactions extends React.Component {
  constructor() {
    super();
    this.canLoadMore = true;
  }

  loadMore() {
    if (this.canLoadMore) {
      this.canLoadMore = false;
      this.props.transactionsRequested({
        activePeer: this.props.activePeer,
        address: this.props.address,
        limit: 20,
        offset: this.props.transactions.length,
      });
    }
  }

  componentDidUpdate() {
    const { count, transactions } = this.props;
    this.canLoadMore = count === null || count > transactions.length;
  }

  render() {
    return (
      <Box className={`transactions ${styles.activity}`}>
        <header>
          <h2 className={styles.title}>{this.props.t('Activity')}</h2>
          <div className={styles.account}>
            <h2>
              <span>
                <LiskAmount val={this.props.balance} />&nbsp;
              </span>
              <small className={styles.balanceUnit}>LSK</small>
            </h2>
            <CopyToClipboard value={this.props.address} className={`${styles.address}`} />
          </div>
        </header>

        <ul className={styles.list}>
          <li className={`${styles.item} ${styles.active}`}>All</li>
          <li className={styles.item}>Incoming</li>
          <li className={styles.item}>Outgoing</li>
          <li className={styles.item}>Other</li>
        </ul>
        <TransactionList
          transactions={this.props.transactions}
          loadMore={this.loadMore.bind(this)}
          nextStep={this.props.nextStep}
          t={this.props.t} />
      </Box>
    );
  }
}

export default Transactions;