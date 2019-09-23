import React, {Component} from "react";
import {connect} from "react-redux";
import "react-table/react-table.css";
import axios from "axios";

import _ from "lodash";

import {Col, Row} from "reactstrap";

import "./NpiUsers.scss";

const CancelToken = axios.CancelToken;
let cancel;

const API_URL = process.env.REACT_APP_API_URL;

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
    this.setState({
      loading: false,
      products: sortedData,
    })
  };
  
  
  render() {
    const {products} = this.state;
    if (!products) {
      return (<div/>);
    }
    console.log({products})
    const address = _.find(products.addresses, {"address_purpose": "LOCATION"});
    // const postal_code = address && address.postal_code.splice(6, 0, '-');
    var chuncks = address.postal_code.match(/.{1,5}/g);
    var postal_code = chuncks.join("-");
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
                <h2>NPI Lookup Search</h2>
                <hr />
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h2 className="panel-title">Contact Information</h2>
                  </div>
                  <div className="panel-body">
                    <div className="col-md-8">
                      <img src="https://s3.amazonaws.com/npidb/v2/user.png"
                           className="img-responsive pull-right hidden-xs"
                           data-src="https://s3.amazonaws.com/npidb/v2/user.png" alt="BAYLOR COLLEGE OF MEDICINE"/>
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
                      <div style={{height: "30px"}}></div>
                      <div className="table-responsive">
                        <table className="table" style={{marginTop: "10px"}}>
                          <thead>
                          <tr className="bg-warning">
                            <td>&nbsp;</td>
                            <td><h2 className="panel-title">Specialty</h2></td>
                            <td className="nowrap width-150">Taxonomy Code</td>
                            <td className="nowrap width-150"><span title="Medicare Specialty Code">Specialty Code</span>
                            </td>
                            <td className="nowrap width-150"><span title="Medicare Provider Type">Provider Type</span>
                            </td>
                          </tr>
                          </thead>
                          <tbody>
                          {
                            _.map(taxonomies, items => {
                              return (<tr>
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
                                <td className="text-right"></td>
                                <td></td>
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
                    <div className="col-md-4">
                      <div id="mapDiv" style={{"width": "100%", "maxHeight": "280px"}}>
                        <iframe style={{"width": "100%", "border": 0}} height="280" id="map"
                                src={`https://www.google.com/maps/embed/v1/place?q=${address.address_1}, ${address.city}, ${address.state} ${postal_code}, ${address.country_code}&key=AIzaSyCeasx-MyOIF_UmM5ic32GJRYrShBDGtko`}></iframe>
                      </div>
                    </div>
                    <div className="clearfix"></div>
                    <hr />
                  </div>
                </div>
              </Col>
            </Row>
            <div className="row">
              <div className="col-md-8">
                <div className="panel panel-info">
                  <div className="panel-heading">
                    <h2 className="panel-title">
                      NPI Profile &amp; details for
                      &nbsp; {nameDesc} { !isOrg &&<span className="text-danger"> <span className="glyphicon glyphicon-user"></span> ({ products.basic.gender === "M"? "Male" : "Female"})</span> }</h2>
                  </div>
                  <div className="panel-body">
                    <div>
                      <div className="table-responsive">
                        <table className="table">
                          <tbody>
                          <tr>
                            <td className="bg-warning text-nowrap"><strong>NPI #</strong></td>
                            <td style={{"width": "100%"}}><code className="lead">{products.number}</code></td>
                          </tr>
                          { isOrg &&
                          <tr>
                            <td className="bg-warning nowrap"><strong>LBN</strong>
                              <small>Legal business name</small>
                            </td>
                            <td><span>{products.basic.name}</span></td>
                          </tr>
                          }
                          { isOrg &&
                          <tr>
                            <td className="bg-warning nowrap"><strong>Authorized official</strong></td>
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
                            <td className="bg-warning"><strong>Status</strong></td>
                            <td><span>{products.basic.status === "A" ? "Active" : "De-active"}</span></td>
                          </tr>
                          }
                          { !isOrg &&
                          <tr>
                            <td className="bg-warning"><strong>Credentials</strong></td>
                            <td><span>{products.basic.credentials}</span></td>
                          </tr>
                          }
                          
                          <tr>
                            <td className="bg-warning"><strong>Entity</strong></td>
                            <td><span>{isOrg ? "Organization": "Individual"}</span></td>
                          </tr>
                          { isOrg &&
                          <tr>
                            <td className="bg-warning nowrap"><strong>Organization subpart</strong> <sup>1</sup></td>
                            <td>
                              <span>
                                {products.basic.organizational_subpart}
                              </span>
                            </td>
                          </tr>
                          }
                          <tr>
                            <td className="bg-warning nowrap"><strong>Enumeration date</strong></td>
                            <td style={{"width": "100%"}}><span>{products.basic.enumeration_date}</span></td>
                          </tr>
                          <tr>
                            <td className="bg-warning nowrap text-nowrap"><strong>Last updated</strong></td>
                            <td>
                              <span>{products.basic.last_updated} - <small>About 8 years ago</small></span>
                            </td>
                          </tr>
                          { !isOrg &&
                          <tr>
                            <td className="bg-warning nowrap text-nowrap"><strong>Sole proprietor</strong></td>
                            <td>
                              <span>{products.basic.sole_proprietor} </span>
                            </td>
                          </tr>
                          }
                          <tr>
                            <td className="bg-warning"><strong>Identifiers</strong></td>
                            <td>
                              <div className="table-not-responsive">
                                {products.identifiers.length <= 0 ? "Not Available" :
                                  <table className="table table-condensed">
                                    <tbody>
                                    {
                                      _.map(products.identifiers, identifiers => {
                                        return (
                                          <tr>
                                            <td style={{"border":0}}>{identifiers.state}</td>
                                            <td style={{"border":0}} className="nowrap">{identifiers.desc} #</td>
                                            <td style={{"border":0}}><span className="text-danger nowrap">{identifiers.identifier}</span></td>
                                            <td style={{"border": 0, "width": "100%;"}}>{identifiers.issuer}</td>
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
                            <td className="bg-warning text-nowrap"><strong>Hospital affiliation(s)</strong></td>
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

