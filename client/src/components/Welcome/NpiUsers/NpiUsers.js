import React, {Component} from "react";
import {connect} from "react-redux";
import "react-table/react-table.css";
import classnames from "classnames";
import axios from "axios";
import moment from "moment";
import { CSVLink, CSVDownload } from "react-csv";

import _ from "lodash";

import {Col, Row} from "reactstrap";

import "./NpiUsers.scss";
import styles from  "./NpiUsers.scss";
import headerImg from "./../fb_final_01.jpg";
const CancelToken = axios.CancelToken;
let cancel;

const API_URL = 'http://54.174.244.177:3003/api';

class NpiUsers extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      filter: {},
      products: null,
      loading: true,
    };
  }
  
  getUserData() {
    let id = this.props.match.params.id;
    console.log({id});
    if (id)
      this.getData({"number": id});
    //this.setState({ folder: params.folder || 'sketches' }, (folder) => this.loadProjects(this.state.folder));
  }
  
  componentDidMount() {
    this.getUserData()
  }
  
  getData = async (query) => {
    if (cancel) {
      cancel();
    }
    const response = await axios.get(`${API_URL}/users/data?query=${query ? JSON.stringify(query) : JSON.stringify(query)}`, {
      headers: {authorization: localStorage.getItem('token')},
      cancelToken: new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancel = c;
      })
    });
    console.log({d: response.data.data.results})
    
    const sortedData = response.data.data && response.data.data.results ? response.data.data.results[0] : {};
    const isOrg = sortedData.enumeration_type === "NPI-2";
    const nameDesc = isOrg ? sortedData.basic.name : `${sortedData.basic.first_name} ${sortedData.basic.middle_name} ${sortedData.basic.last_name}`;
    let data = {};
    let stringData = {}
    let gender = '';
    switch(sortedData.basic.gender) {
      case 'M':
        gender = 'Male';
        break;
      case 'F':
        gender = 'Female';
        break;
      case 'O':
        gender = 'Other';
        break;
      default:
        gender = 'unknown';
    }
    if(isOrg){
      data = {
        "resourceType" : sortedData.enumeration_type === "NPI-2" ? "Organization" : "Practitioner",
        // from Resource: id, meta, implicitRules, and language
        // from DomainResource: text, contained, extension, and modifierExtension
        "identifier" : sortedData.identifiers, // C? Identifies this organization  across multiple systems
        "active" : sortedData.basic.status === "A", // Whether the organization's record is still in active use
        "type" : 'prov', // Kind of organization
        "name" : nameDesc, // C? Name used for the organization
        "alias" : [""], // A list of alternate names that the organization is known as, or was known as in the past
        "telecom" : [{
          authorized_official_credential: sortedData.basic.authorized_official_credential,
          authorized_official_first_name: sortedData.basic.authorized_official_first_name,
          authorized_official_last_name: sortedData.basic.authorized_official_last_name,
          authorized_official_telephone_number: sortedData.basic.authorized_official_telephone_number,
          authorized_official_title_or_position: sortedData.basic.authorized_official_title_or_position,
        }], // C? A contact detail for the organization
        "address" : sortedData.addresses, // C? An address for the organization
        "contact" : sortedData.addresses,
        "endpoint" : [{  }] // Technical endpoints providing access to services operated for the organization
      };
      stringData = {
        "resourceType" : sortedData.enumeration_type === "NPI-2" ? "Organization" : "Practitioner",
        // from Resource: id, meta, implicitRules, and language
        // from DomainResource: text, contained, extension, and modifierExtension
        "identifier" : sortedData.identifiers, // C? Identifies this organization  across multiple systems
        "active" : sortedData.basic.status === "A", // Whether the organization's record is still in active use
        "type" : 'prov', // Kind of organization
        "name" : nameDesc, // C? Name used for the organization
        "alias" : [""], // A list of alternate names that the organization is known as, or was known as in the past
        authorized_official_credential: sortedData.basic.authorized_official_credential,
        authorized_official_first_name: sortedData.basic.authorized_official_first_name,
        authorized_official_last_name: sortedData.basic.authorized_official_last_name,
        authorized_official_telephone_number: sortedData.basic.authorized_official_telephone_number,
        authorized_official_title_or_position: sortedData.basic.authorized_official_title_or_position,
      }
      _.map(sortedData.addresses, (address, index) => {
        _.forEach(address, function(value, key) {
          if(key === 'postal_code'){
            stringData[`address_${index + 1} ${key}`] =  value.substring(0,5);
          }
          else
          {
            stringData[`address_${index + 1} ${key}`] = value;
          }
        });
      });
    }
    else {
      data = {
        "resourceType" : sortedData.enumeration_type === "NPI-2" ? "Organization" : "Practitioner",
        // from Resource: id, meta, implicitRules, and language
        // from DomainResource: text, contained, extension, and modifierExtension
        "identifier" : sortedData.identifiers, // C? Identifies this organization  across multiple systems
        "active" : sortedData.basic.status === "A", // Whether the organization's record is still in active use
        "name" : nameDesc, // C? Name used for the organization
        "telecom" : sortedData.addresses, // C? A contact detail for the organization
        "address" : sortedData.addresses, // C? An address for the organization
        "gender" : gender, // male | female | other | unknown
        "birthDate" : "", // The date  on which the practitioner was born
        // "photo" : [{  }], // Image of the person
        // "qualification" : [{ // Certification, licenses, or training pertaining to the provision of care
        //   "identifier" : [{ }], // An identifier for this qualification for the practitioner
        //   "code" : {  }, // R!  Coded representation of the qualification
        //   "period" : {  }, // Period during which the qualification is valid
        //   "issuer" : {} // Organization that regulates and issues the qualification
        // }],
        "communication" : [{  }] // A language the practitioner can use in patient communication
      };
      stringData = {
        "resourceType" : sortedData.enumeration_type === "NPI-2" ? "Organization" : "Practitioner",
        // from Resource: id, meta, implicitRules, and language
        // from DomainResource: text, contained, extension, and modifierExtension
        // "identifier" : sortedData.identifiers, // C? Identifies this organization  across multiple systems
        "active" : sortedData.basic.status === "A", // Whether the organization's record is still in active use
        "name" : nameDesc, // C? Name used for the organization
        "gender" : gender, // male | female | other | unknown
      }
      _.forEach(sortedData.identifiers, function(value, key) {
        stringData[`identifier  ${key}`] = value;
      });
      
      _.map(sortedData.addresses, (address, index) => {
        _.forEach(address, function(value, key) {
          if(key === 'postal_code'){
            stringData[`address_${index + 1} ${key}`] =  value.substring(0,5);
          }
          else
          {
            stringData[`address_${index + 1} ${key}`] = value;
          }
        });
      });
    }
   
    this.setState({
      loading: false,
      products: sortedData,
      stringData: [stringData],
      json: data
    })
  };
  
  getPostCode = (number) => {
    const chuncks = number.match(/.{1,5}/g);
   return  chuncks.join("-");
  }
  
  onJsonDownload = (storageObj) => {
    const isOrg = storageObj.enumeration_type === "NPI-2";
    let nameDesc = isOrg ? storageObj.basic.name : `${storageObj.basic.first_name} ${storageObj.basic.middle_name} ${storageObj.basic.last_name}`;
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storageObj));
    var dlAnchorElem = document.getElementById('downloadCSV');
    dlAnchorElem.setAttribute("href",     dataStr     );
    nameDesc = nameDesc.replace(/ /g,"_")
    dlAnchorElem.setAttribute("download", `${nameDesc}.json`);
    dlAnchorElem.click();
  }
  
  
  render() {
    const {products, json, stringData} = this.state;
    if (!products) {
      return (<div/>);
    }
    const address = _.find(products.addresses, {"address_purpose": "LOCATION"});
    const mailing_address = _.find(products.addresses, {"address_purpose": "MAILING"});
    // const postal_code = address && address.postal_code.splice(6, 0, '-');
    const chuncks = address.postal_code.match(/.{1,5}/g);
    const postal_code = chuncks.join("-");
    // const taxonomies = _.filter(products.taxonomies, {"primary": true});
    const taxonomies = products.taxonomies;
    const isOrg = products.enumeration_type === "NPI-2";
    const nameDesc = isOrg ? products.basic.name : `${products.basic.first_name} ${products.basic.middle_name} ${products.basic.last_name}`;
    return <React.Fragment>
      <header className="intro-head">
      
        <div className="container">
          <div className="form-container">
            <Row>
              <Col>
                <div>
                  <img src={headerImg} style={{"width": "100%"}} />
                </div>
                <hr />
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h2 className={classnames("panel-title penalTitle", styles.penalTitle)}>Contact Information</h2>
                  </div>
                  <div className="panel-body">
                    <div className="col-md-12 inline-block" style={{"display": "inline-block"}}>
                      <div className="col-md-2">
                        <img src="https://s3.amazonaws.com/npidb/v2/user.png"
                             className="img-responsive  hidden-xs"
                             data-src="https://s3.amazonaws.com/npidb/v2/user.png" alt="BAYLOR COLLEGE OF MEDICINE"/>
                      </div>
                      <div className="col-md-10">
                        <strong className="lead text-success" itemProp="name">
                          {nameDesc}
                        </strong>
                        <address className="lead" style={{"paddingLeft": "20px"}} itemProp="address">
                          <span>{address.address_1}</span><br />
                          {address.address_2 && [<span>{address.address_2}</span>, <br />]}
                          <span>{address.city}</span>, <span>{address.state}</span> &nbsp;&nbsp;
                          <span>{address.postal_code}</span>
                        </address>
                        <span className="glyphicon glyphicon-phone-alt" title="Phone"></span> Phone: <span
                        itemProp="telephone">{address.telephone_number}</span><br />
                        <span className="glyphicon glyphicon-print" title="Fax"></span> Fax: <span
                        itemProp="faxNumber">{address.fax_number}</span><br />
                        <span className="glyphicon glyphicon-globe" title="Website"></span> Website:
                        <br />
                        {products &&  <button className="btn btn-primary" onClick={() => {this.onJsonDownload(products);}} >Export as JSON</button> }
                        {products && stringData &&  <CSVLink className="btn btn-info ml-15" data={ stringData || []} target="_blank" filename={`${nameDesc}.csv`} >Export as CSV</CSVLink> }
                        <a id="downloadCSV" className="hide" />
                        <div style={{height: "30px"}}></div> <br />
                      </div>
                      
                    </div>
                    <div className="col-md-12">
                      <div className="table-responsive">
                        <table className="table" style={{marginTop: "10px"}}>
                          <thead>
                          <tr className="bglight bg-warning">
                            <td>&nbsp;</td>
                            <td><h2 className="panel-title">Specialty</h2></td>
                            <td className="nowrap width-150">Taxonomy Code</td>
                            <td className="nowrap width-150"><span title="Medicare Specialty Code">State</span>
                            </td>
                            <td className="nowrap width-150"><span title="Medicare Provider Type">License</span>
                            </td>
                          </tr>
                          </thead>
                          <tbody>
                          {
                            _.map(taxonomies, items => {
                              return (<tr key={items.code}>
                                <td>
                                  {items.primary &&
                                  <span className="glyphicon glyphicon-star" title="Primary Specialty"></span>}
                                </td>
                                <td style={{"width": "100%"}} itemProp="medicalSpecialty" itemScope="">
                                  <h3 style={{"margin": 0, "fontSize": "medium"}}>
                                    <span itemProp="name">{items.desc}</span>
                                  </h3>
                                </td>
                                <td>
                                  <span>{items.code}</span>
                                </td>
                                <td className="text-right">{items.state}</td>
                                <td>{items.license}</td>
                              </tr>)
                            })
                          }
      
                          </tbody>
                        </table>
                      </div>
                      <small className="text-muted"><span className="glyphicon glyphicon-star"
                                                          title="Primary Specialty"></span> Indicates primary
                        specialty
                      </small>
                      <div className="div20"></div>
                    </div>
                    
                    <div className="clearfix"></div>
                    <hr />
                  </div>
                </div>
              </Col>
            </Row>
            <div className="row">
             
              <div className="col-md-6">
                <div className="panel panel-info">
                  <div className="panel-heading">
                    <h2 className="panel-title penalTitle">
                      NPI Profile &amp; details for&nbsp;{nameDesc}</h2>
                  </div>
                  <div className="panel-body">
                    <div>
                      <div className="table-responsive">
                        <table className="table">
                          <tbody>
                          <tr>
                            <td className="bglight bg-warning text-nowrap"><strong>NPI #</strong></td>
                            <td style={{"width": "100%"}}><code className="lead">{products.number}</code></td>
                          </tr>
                          { isOrg &&
                          <tr>
                            <td className="bglight bg-warning nowrap"><strong>LBN</strong>
                              <small>Legal business name</small>
                            </td>
                            <td><span>{products.basic.name}</span></td>
                          </tr>
                          }
                          { isOrg &&
                          <tr>
                            <td className="bglight bg-warning nowrap"><strong>Authorized official</strong></td>
                            <td>
                              <span>
                                {products.basic.authorized_official_first_name} {products.basic.authorized_official_last_name}
                                - ({products.basic.authorized_official_title_or_position})
                              </span>
                            </td>
                          </tr>
                          }
                          
                          { !isOrg &&
                          <tr>
                            <td className="bglight bg-warning"><strong>Status</strong></td>
                            <td><span>{products.basic.status === "A" ? "Active" : "De-active"}</span></td>
                          </tr>
                          }
                          { !isOrg &&
                          <tr>
                            <td className="bglight bg-warning"><strong>Credentials</strong></td>
                            <td><span>{products.basic.credentials}</span></td>
                          </tr>
                          }
                          { !isOrg &&
                          <tr>
                            <td className="bglight bg-warning"><strong>Gender</strong></td>
                            <td><span>{ products.basic.gender === "M"? "Male" : "Female"}</span></td>
                          </tr>
                          }
                          <tr>
                            <td className="bglight bg-warning nowrap"><strong>Mailing Address</strong></td>
                            <td>
                              <span>
                                {mailing_address.address_1},< br />
                                {mailing_address.city}, {mailing_address.state} {this.getPostCode(mailing_address.postal_code)}< br />
                                Phone: {mailing_address.telephone_number} | Fax: {mailing_address.fax_number}
  
                                < br />
                                <a target="_blank" href={`https://maps.google.com/?q=${mailing_address.address_1}, ${mailing_address.city}, ${mailing_address.state} ${this.getPostCode(mailing_address.postal_code)}, ${mailing_address.country_code}`}>
                                View on map</a>
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="bglight bg-warning nowrap"><strong>Primary Practice Address</strong></td>
                            <td>
                              <span>
                                {address.address_1},< br />
                                {address.city}, {address.state} {postal_code}< br />
                                Phone: {address.telephone_number} | Fax: {address.fax_number}
                              </span>
                              <br />
                              <a target="_blank" href={`https://maps.google.com/?q=${address.address_1}, ${address.city}, ${address.state} ${this.getPostCode(address.postal_code)}, ${address.country_code}`}>
                                View on map</a>
                            </td>
                          </tr>
                          {
                            _.map(products.practiceLocations, (location, index) =>{
                              return(
                                <tr>
                                  <td className="bglight bg-warning nowrap"><strong>Practice Address{index + 1}</strong></td>
                                  <td>
                                <span>
                                  {location.address_1},< br />
                                  {location.city}, {location.state} {this.getPostCode(location.postal_code)}< br />
                                  Phone: {location.telephone_number} | Fax: {location.fax_number}
                                </span>
                                    <br />
                                    <a target="_blank" href={`https://maps.google.com/?q=${location.address_1}, ${location.city}, ${location.state} ${this.getPostCode(location.postal_code)}, ${location.country_code}`}>
                                      View on map</a>
                                  </td>
                                </tr>
                              )
                            })
                          }
                          <tr>
                            <td className="bglight bg-warning"><strong>Entity</strong></td>
                            <td><span>{isOrg ? "Organization": "Individual"}</span></td>
                          </tr>
                          { isOrg &&
                          <tr>
                            <td className="bglight bg-warning nowrap"><strong>Organization subpart</strong> <sup>1</sup></td>
                            <td>
                              <span>
                                {products.basic.organizational_subpart}
                              </span>
                            </td>
                          </tr>
                          }
                          <tr>
                            <td className="bglight bg-warning nowrap"><strong>Enumeration date</strong></td>
                            <td style={{"width": "100%"}}><span>{products.basic.enumeration_date}</span></td>
                          </tr>
                          <tr>
                            <td className="bglight bg-warning nowrap text-nowrap"><strong>Last updated</strong></td>
                            <td>
                              <span>{products.basic.last_updated} - <small>About&nbsp; {moment(moment(products.basic.last_updated)).fromNow()}</small></span>
                            </td>
                          </tr>
                          { !isOrg &&
                          <tr>
                            <td className="bglight bg-warning nowrap text-nowrap"><strong>Sole proprietor</strong></td>
                            <td>
                              <span>{products.basic.sole_proprietor} </span>
                            </td>
                          </tr>
                          }
                          <tr>
                            <td className="bglight bg-warning"><strong>Identifiers</strong></td>
                            <td>
                              <div className="table-not-responsive">
                                {products.identifiers.length <= 0 ? "Not Available" :
                                  <table className="table table-condensed">
                                    <thead>
                                      <tr>
                                        <th>State</th>
                                        <th>Name</th>
                                        <th>Identifier</th>
                                        <th>Issuer</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                    {
                                      _.map(products.identifiers, identifiers => {
                                        return (
                                          <tr>
                                            <td style={{"border":0}}>{identifiers.state}</td>
                                            <td style={{"border":0}} className="nowrap">{identifiers.desc} #</td>
                                            <td style={{"border":0}}><span className="text-danger nowrap">{identifiers.identifier}</span></td>
                                            <td style={{"border": 0, "width": "100%"}}>{identifiers.issuer}</td>
                                          </tr>
                                        )
                                      })
                                    }
                                    </tbody>
                                  </table>
                                }
                              </div>
                            </td>
                          </tr>
                          { !isOrg &&
                          <tr>
                            <td className="bglight bg-warning text-nowrap"><strong>Hospital affiliation(s)</strong></td>
                            <td>
                              <div className="table-not-responsive">
                                Not Available
                              </div>
                            </td>
                          </tr>
                          }
                          </tbody>
                        </table>
                      </div>
                      <div className="div10"></div>
                    </div>
                    <div className="clearfix"></div>
                    <div className="div20"></div>
                    <sup>1</sup>
                    <small className="text-muted">
                      Some organization health care providers are made up of components that furnish different types of
                      health care or have separate physical locations where health care is furnished. These components
                      and physical locations are not themselves legal entities, but are part of the organization health
                      care provider (which is a legal entity).
                      A covered organization provider may decide that its subparts (if it has any) should have their own
                      NPI numbers. If a subpart conducts any <abbr
                      title="Health Insurance Portability and Accountability Act">HIPAA</abbr> standard transactions on
                      its own (e.g., separately from its parent), it must obtain its own NPI number.
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <iframe style={{"width": "100%", "border": 0}} height="550" id="map"
                        src={`https://www.google.com/maps/embed/v1/place?q=${address.address_1}, ${address.city}, ${address.state} ${postal_code}, ${address.country_code}&key=AIzaSyDqxmTSwRFA9OOzLYP38Eqp1C9R8UlrIxo`}></iframe>
              </div>
            </div>
        
          </div>
      
        </div>
        <div className="container">
        </div>
      </header>
    </React.Fragment>
      ;
    const name = isOrg ? products.basic.name : `${products.basic.first_name} ${products.basic.middle_name} ${products.basic.last_name}`;
  }
}

const mapStateToProps = (state) => {
  return {
    me: state.auth.me,
    products: state.system.data || []
  }
};

const mapDispatchToProps = (dispatch) => {
  return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(NpiUsers);

