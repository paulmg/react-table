import 'babel-polyfill'

import React, { Component } from 'react'
import { render } from 'react-dom'
import { fromJS, default as Immutable } from 'immutable'
import Chance from 'chance'

import selectTableHOC from './src/hoc/selectTable'
import treeTableHOC from './src/hoc/treeTable'

import ReactTable from './src'
import testData from './test_data'

const SelectTreeTable = selectTableHOC(treeTableHOC(ReactTable))

const styles = {
  fontFamily: 'sans-serif'
}

// const CheckboxTable = checkboxHOC(ReactTable);

const chance = new Chance()

function getData () {
  const data = testData.map((item) => {
    // using chancejs to generate guid
    // shortid is probably better but seems to have performance issues
    // on codesandbox.io
    const _id = chance.guid()
    return {
      _id,
      ...item,
    }
  })

  // return fromJS(data)
  return data
}

const ignoreColumns = ['phone1', 'phone2', 'web', 'email', '_id']

function getColumns (data) {
  const columns = []
  const sample = Immutable.Iterable.isIterable(data) ? data.get(0) : data[0]

  Immutable.Iterable.isIterable(sample) ?
    sample.keySeq().forEach((key) => {
      if (!ignoreColumns.includes(key)) {
        columns.push({
          accessor: key,
          Header: key,
          style: {whiteSpace: 'normal'},
        })
      }
    })
    : Object.keys(sample).forEach((key) => {
      if (!ignoreColumns.includes(key)) {
        columns.push({
          accessor: key,
          Header: key,
          style: {whiteSpace: 'normal'},
        })
      }
    })

  return columns
}

function getNodes (data, node = []) {
  data.forEach((item) => {
    if (item.hasOwnProperty('_subRows') && item._subRows) {
      node = getNodes(item._subRows, node)
    } else {
      node.push(item._original)
    }
  })
  return node
}

class ImmutableTable extends Component {
  constructor (props) {
    super(props)

    const data = getData()
    const columns = getColumns(data)

    this.state = {
      data,
      columns,
      selection: [],
      selectAll: false,
      selectType: 'checkbox',
      pivotBy: ['state', 'post'],
      expanded: {}
    }
  }

  toggleSelection = (key, shift, row) => {
    /*
      Implementation of how to manage the selection state is up to the developer.
      This implementation uses an array stored in the component state.
      Other implementations could use object keys, a Javascript Set, or Redux... etc.
    */
    // start off with the existing state
    if (this.state.selectType === 'radio') {
      let selection = []
      if (selection.indexOf(key) < 0) selection.push(key)
      this.setState({selection})
    } else {
      let selection = [
        ...this.state.selection
      ]
      const keyIndex = selection.indexOf(key)
      // check to see if the key exists
      if (keyIndex >= 0) {
        // it does exist so we will remove it using destructing
        selection = [
          ...selection.slice(0, keyIndex),
          ...selection.slice(keyIndex + 1)
        ]
      } else {
        // it does not exist so add it
        selection.push(key)
      }
      // update the state
      this.setState({selection})
    }
  }

  toggleAll = () => {
    /*
      'toggleAll' is a tricky concept with any filterable table
      do you just select ALL the records that are in your data?
      OR
      do you only select ALL the records that are in the current filtered data?

      The latter makes more sense because 'selection' is a visual thing for the user.
      This is especially true if you are going to implement a set of external functions
      that act on the selected information (you would not want to DELETE the wrong thing!).

      So, to that end, access to the internals of ReactTable are required to get what is
      currently visible in the table (either on the current page or any other page).

      The HOC provides a method call 'getWrappedInstance' to get a ref to the wrapped
      ReactTable and then get the internal state and the 'sortedData'.
      That can then be iterrated to get all the currently visible records and set
      the selection state.
    */
    const selectAll = this.state.selectAll ? false : true
    const selection = []
    if (selectAll) {
      // we need to get at the internals of ReactTable
      const wrappedInstance = this.selectTable.getWrappedInstance()
      // the 'sortedData' property contains the currently accessible records based on the filter and sort
      const currentRecords = wrappedInstance.getResolvedState().sortedData
      // we need to get all the 'real' (original) records out to get at their IDs
      const nodes = getNodes(currentRecords)
      // we just push all the IDs onto the selection array
      nodes.forEach((item) => {
        selection.push(item.get('_id'))
      })
    }

    this.setState({selectAll, selection})
  }

  isSelected = (key) => {
    /*
      Instead of passing our external selection state we provide an 'isSelected'
      callback and detect the selection state ourselves. This allows any implementation
      for selection (either an array, object keys, or even a Javascript Set object).
    */
    return this.state.selection.includes(key)
  }

  logSelection = () => {
    console.log('selection:', this.state.selection)
  }

  toggleType = () => {
    this.setState({selectType: this.state.selectType === 'radio' ? 'checkbox' : 'radio', selection: [], selectAll: false,})
  }

  toggleTree = () => {
    if (this.state.pivotBy.length) {
      this.setState({pivotBy: [], expanded: {}})
    } else {
      this.setState({pivotBy: ['state', 'post'], expanded: {}})
    }
  }

  onExpandedChange = (expanded) => {
    this.setState({expanded})
  }

  render () {
    const {
            toggleSelection, toggleAll, isSelected,
            logSelection, toggleType,
            onExpandedChange, toggleTree,
          } = this
    const {data, columns, selectAll, selectType, pivotBy, expanded} = this.state
    const extraProps = {
      selectAll,
      isSelected,
      toggleAll,
      toggleSelection,
      selectType,
      pivotBy,
      expanded,
      onExpandedChange,
    }

    // const data = fromJS([
    //   {
    //     name: 'Tanner Linsley',
    //     age: 26,
    //     friend: {
    //       name: 'Jason Maurer',
    //       age: 23
    //     }
    //   },
    //   {
    //     name: 'Tan Lin',
    //     age: 20,
    //     friend: {
    //       name: 'Jas Mau',
    //       age: 50
    //     }
    //   },
    //   {
    //     name: 'Linsley',
    //     age: 261,
    //     friend: {
    //       name: 'Jason',
    //       age: 2
    //     }
    //   },
    //   {
    //     name: 'John Doe',
    //     age: 26,
    //     friend: {
    //       name: 'Jane Doe',
    //       age: 33
    //     }
    //   },
    //   {
    //     name: 'P Diddy',
    //     age: 99,
    //     friend: {
    //       name: 'Jason Maurer',
    //       age: 18
    //     }
    //   }
    // ])

    // const columns = [
    //   {
    //     Header: 'Name',
    //     accessor: 'name',
    //     style: {
    //       backgroundColor: 'rgba(0, 0, 0, 0.1)'
    //     }
    //   },
    //   {
    //     Header: 'Age',
    //     accessor: 'age',
    //     Cell: props => <span className="number">{props.value}</span>,
    //     filterMethod: (filter, row) => {
    //       if (filter.value === 'all') {
    //         return true
    //       }
    //       if (filter.value === 'true') {
    //         return row[filter.id] >= 21
    //       }
    //       return row[filter.id] < 21
    //     },
    //     Filter: ({filter, onChange}) =>
    //       <select
    //         onChange={event => onChange(event.target.value)}
    //         style={{width: '100%'}}
    //         value={filter ? filter.value : 'all'}
    //       >
    //         <option value="all">Show All</option>
    //         <option value="true">Can Drink</option>
    //         <option value="false">Can't Drink</option>
    //       </select>
    //   },
    //   {
    //     id: 'friendName', // Required because our accessor is not a string
    //     Header: 'Friend Name',
    //     accessor: d => d.getIn(['friend', 'name'])
    //   },
    //   {
    //     Header: props => <span>Friend Age</span>,
    //     accessor: 'friend.age',
    //     filterMethod: (filter, row) => {
    //       if (filter.value === 'all') {
    //         return true
    //       }
    //       if (filter.value === 'true') {
    //         return row[filter.id] >= 21
    //       }
    //       return row[filter.id] < 21
    //     },
    //     Filter: ({filter, onChange}) =>
    //       <select
    //         onChange={event => onChange(event.target.value)}
    //         style={{width: '100%'}}
    //         value={filter ? filter.value : 'all'}
    //       >
    //         <option value="all">Show All</option>
    //         <option value="true">Can Drink</option>
    //         <option value="false">Can't Drink</option>
    //       </select>
    //   }
    // ]

    // return <SelectTreeTable
    //   filterable
    //   defaultFilterMethod={(filter, row) => String(row[filter.id]).toLowerCase() === filter.value.toLowerCase()}
    //   SubComponent={row => {
    //     return (
    //       <div style={{padding: '20px'}}>
    //         {row.row.name}
    //       </div>
    //     )
    //   }}
    //   data={data} columns={columns} {...{...this.props}}
    // />

    return (
      <div>
        <button onClick={toggleTree}>Toggle Tree [{pivotBy && pivotBy.length ? pivotBy.join(', ') : ''}]</button>
        <button onClick={toggleType}>Select Type: <strong>{selectType}</strong></button>
        <button onClick={logSelection}>Log Selection to Console</button>

        {
          data ?
            <SelectTreeTable
              data={data}
              columns={columns}
              ref={(r) => this.selectTable = r}
              className="-striped -highlight"
              {...extraProps}
              pageSize={5}
              freezWhenExpanded={true}
            />
            : null
        }
      </div>
    )
  }
}

const App = () => (
  <div style={styles}>
    <ImmutableTable
      showPagination={false}
      className='-striped -highlight'
      minRows={1}
    />
  </div>
)

render(<App />, document.getElementById('root'))
