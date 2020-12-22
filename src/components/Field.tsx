import React from 'react';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import AsyncSelect from 'react-select/async';

type OptionType = {
  value: string;
  label: string;
};


let options: OptionType[] = [
  { value: '11', label: '11' },
  { value: '12', label: '12' },
  { value: '13', label: '13' }
]

interface FieldProps {
  sdk: FieldExtensionSDK;
}
type MyProps = FieldProps
type MyState = { 
  inputValue: string,
  items: OptionType[],
  launches : Array<Object>


};
class Field extends React.Component<MyProps,MyState>{

  constructor(props: FieldProps){
    super(props)
    console.log(props)
    this.state= {
      inputValue: "",
      items : options,
      launches : []
    }
    this.setlaunches = this.setlaunches.bind(this)
    this.setItems = this.setItems.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.loadOptions = this.loadOptions.bind(this)
    this.spaceX_fetch = this.spaceX_fetch.bind(this)
    this.onValueChange = this.onValueChange.bind(this)
  }

  spaceX_fetch = (inputValue: string)=>{
    let options: OptionType[] = []
    const lowernum = parseInt(inputValue)-1
    const biggernum = parseInt(inputValue)*10
    if(isNaN(lowernum)){
      return []
    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "__cfduid=d2f5fec261c8886084279ed0e67dfd73f1608085699");

    var raw = JSON.stringify({"query":{"flight_number":{"$gt":lowernum,"$lt":biggernum},"upcoming":"false"},"options":{"limit":3}});

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw
    };

    return fetch("https://api.spacexdata.com/v4/launches/query", requestOptions)
      .then(res => res.json())
      .then(items => items.docs)
      .then(
        (docs) => {
          console.log(docs)
          options = docs.map((doc: any)=>{
            return { value: doc, label: doc.flight_number}
          })
          return options
          
        }
      );

  }

  setItems(items: any){
    console.log(items)
    this.setState({
      items: items
    })
  }

  setlaunches(docs: any){
    this.setState({
      launches : docs
    })
  }


  handleInputChange = (newValue: string) => {
    const inputValue = newValue.replace(/\W/g, '');
    this.setState({ inputValue });
    return inputValue;
  };

  loadOptions = (inputValue : any) => {
    return Promise.resolve(this.spaceX_fetch(inputValue))
  };

  onValueChange = async (e: any) =>{
    console.log(this.props.sdk)
    console.log(e)
    this.props.sdk.field.setValue(e.label)
    let data= e.value
    this.props.sdk.entry.fields.launchDate.setValue(data.date_utc)
    this.props.sdk.entry.fields.launchDetails.setValue(data.details)
    this.props.sdk.entry.fields.launchVideoUrl.setValue(data.links.webcast)
    this.props.sdk.entry.fields.missionPatchUrl.setValue(data.links.patch.large)
    this.props.sdk.entry.fields.name.setValue(data.name)

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "__cfduid=d2f5fec261c8886084279ed0e67dfd73f1608085699");

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
    };



    const rocket_id = data.rocket 
    let rep: any = await fetch(`https://api.spacexdata.com/v4/rockets/${rocket_id}`, requestOptions)
    rep = await rep.json()
    console.log(rep)
    const name = rep["name"]
    const type = rep["type"] 
    this.props.sdk.entry.fields.rocketName.setValue(name)
    this.props.sdk.entry.fields.rocketType.setValue(type)
    this.props.sdk.entry.fields.webcastVideoUrl.setValue(data.links.webcast)
    this.props.sdk.entry.fields.missionSuccess.setValue(data.success)

  }
  
  

  render(){

    return (
      <div>
        <AsyncSelect
          onChange= {(e)=>{this.onValueChange(e)}}
          cacheOptions
          loadOptions={this.loadOptions}
          defaultOptions
          onInputChange={this.handleInputChange}
        />
      </div>
    )
  }
}

//Removed as not neccessary to keep flight_number values solely a number
/* const handleNumberOnlyInput = (e: React.KeyboardEvent) => {
  console.log(e.nativeEvent.code)
  if (e.nativeEvent.code === "KeyE" || e.nativeEvent.code === "Minus") {
    e.preventDefault();
  }
};
 */
export default Field;
