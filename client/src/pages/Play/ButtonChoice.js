import React, { Component } from 'react';

const buttonStyleList = {
	'default': {backgroundColor: 'black'},
	'wrong':{backgroundColor: 'red'},
	'correct':{backgroundColor: 'green'},
	'picked':{border: 'solid', borderWidth: 'thick', borderColor: 'black'}
  }
  

class ButtonChoice extends Component {
	render() {
	  var buttonStyle = {}
	  // Add background color if an answer was chosen
	  if (this.props.state === "choosing")
			buttonStyle =  Object.assign(buttonStyle, buttonStyleList.default)
	  else
			buttonStyle = this.props.isRightChoice ? Object.assign(buttonStyle, buttonStyleList.correct) : Object.assign(buttonStyle, buttonStyleList.wrong)
	  // Add border if button was clicked
	  if (this.props.isPicked) {
			buttonStyle = Object.assign(buttonStyle, buttonStyleList.picked)
	  }

	  return(
			<h3 style={{display: 'inline-block'}}><a 
				type="button"
				onClick={()=> {this.props.callback(this.props.buttonIndex)}}
				className='Button'
				style={{...buttonStyle, padding:'10px 50px 10px 50px'}}>
				{this.props.track.name}
			</a></h3>
	  )
	}
}

const _default = ButtonChoice;
export { _default as default };