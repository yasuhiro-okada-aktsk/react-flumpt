import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-flumpt';
//import {connect} from '../../../../../../lib/index';

class MyComponentPage extends React.Component {
  componentDidMount() {
    //const {dispatch} = this.props;
    //dispatch("increment");
  }
  
  render() {
    console.log("render");
    const {dispatch, count} = this.props;
    
    return (
      <div>
        <Link to="/">Home</Link>
        <hr />
        {count}
        <br />
        <button onClick={() => dispatch("increment")}>increment</button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    count: state.count
  };
}

export default connect(
  mapStateToProps,
  null,
  {withRef: true}
)(MyComponentPage);
