import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { translate } from 'react-i18next';
import MainMenu from './mainMenu';

const mapStateToProps = state => ({
  isDelegate: state.account.isDelegate,
});

export default withRouter(connect(mapStateToProps)(translate()(MainMenu)));
