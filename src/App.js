import React, { Component } from 'react'
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'
import { connect } from 'react-redux'

import { IntlProvider, addLocaleData } from 'react-intl'
import ru from 'react-intl/locale-data/ru'

import TransactionsView from './components/TransactionsView'
import TagsView from './TagsView'
import Auth from './containers/Auth'
import { getLoginState } from './store/token'

addLocaleData(ru)

class App extends Component {
  render() {
    const isLoggedIn = this.props.isLoggedIn

    return (
      <IntlProvider locale="ru">
        <BrowserRouter>
          <Switch>
            <Route
              path="/transactions"
              render={() =>
                isLoggedIn ? <TransactionsView /> : <Redirect to="/login" />
              }
            />
            <Route
              path="/tags"
              render={() =>
                isLoggedIn ? <TagsView /> : <Redirect to="/login" />
              }
            />
            <Route
              path="/login"
              render={() =>
                isLoggedIn ? <Redirect to="/transactions" /> : <Auth />
              }
            />
            <Redirect to="/transactions" />
          </Switch>
        </BrowserRouter>
      </IntlProvider>
    )
  }
}

const mapStateToProps = state => ({
  isLoggedIn: getLoginState(state)
})

export default connect(
  mapStateToProps,
  null
)(App)
