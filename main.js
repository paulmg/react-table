import 'babel-polyfill'

import React, { Component } from 'react'
import { render } from 'react-dom'
import { List, fromJS } from 'immutable'

import ReactTable from './src'

const styles = {
  fontFamily: 'sans-serif',
  textAlign: 'center'
}

class ImmutableTable extends Component {
  render () {
    const data = List([
      fromJS({
        name: 'Tanner Linsley',
        age: 26,
        friend: {
          name: 'Jason Maurer',
          age: 23
        }
      }),
      fromJS({
        name: 'Tan Lin',
        age: 20,
        friend: {
          name: 'Jas Mau',
          age: 50
        }
      }),
      fromJS({
        name: 'Linsley',
        age: 261,
        friend: {
          name: 'Jason',
          age: 213
        }
      }),
      fromJS({
        name: 'John Doe',
        age: 26,
        friend: {
          name: 'Jane Doe',
          age: 33
        }
      }),
      fromJS({
        name: 'P Diddy',
        age: 99,
        friend: {
          name: 'Jason Maurer',
          age: 23
        }
      })
    ])

    const columns = [
      {
        Header: 'Name',
        accessor: 'name',
        style: {
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }
      },
      {
        Header: 'Age',
        accessor: 'age',
        Cell: props => <span className="number">{props.value}</span> // Custom cell components!
      },
      {
        id: 'friendName', // Required because our accessor is not a string
        Header: 'Friend Name',
        accessor: d => d.getIn(['friend', 'name'])
      },
      {
        Header: props => <span>Friend Age</span>,
        accessor: 'friend.age'
      }
    ]

    return <ReactTable data={data} columns={columns} {...{...this.props}} />
  }
}

const App = () => (
  <div style={styles}>
    <ImmutableTable
      showPagination={false}
      className='-striped -highlight'
      minRows={1} />
  </div>
)

render(<App />, document.getElementById('root'))
