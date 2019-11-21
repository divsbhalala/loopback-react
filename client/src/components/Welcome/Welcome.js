import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import _ from 'lodash';
import classnames from 'classnames';
import {getdata} from "../../actions";
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import axios from 'axios';
import { Scrollbars } from 'react-custom-scrollbars';
import { CSVLink, CSVDownload } from "react-csv";

import { Button, Form, FormGroup, Label, Input, FormText, Row, Col,
  TabContent, TabPane, Nav, NavItem, NavLink, Card, CardTitle, CardText
} from 'reactstrap';
import { AvForm, AvField } from 'availity-reactstrap-validation';


const CancelToken = axios.CancelToken;
let cancel;

const API_URL = 'http://54.174.244.177:3003/api';

class Welcome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: {},
      products: [],
      loading: true,
      searched: false,
      pages: 1,
      activeTab: '1',
      pageSize: 20,
      state: {
        "AL": "Alabama",
        "AK": "Alaska",
        "AS": "American Samoa",
        "AZ": "Arizona",
        "AR": "Arkansas",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DE": "Delaware",
        "DC": "District Of Columbia",
        "FM": "Federated States Of Micronesia",
        "FL": "Florida",
        "GA": "Georgia",
        "GU": "Guam",
        "HI": "Hawaii",
        "ID": "Idaho",
        "IL": "Illinois",
        "IN": "Indiana",
        "IA": "Iowa",
        "KS": "Kansas",
        "KY": "Kentucky",
        "LA": "Louisiana",
        "ME": "Maine",
        "MH": "Marshall Islands",
        "MD": "Maryland",
        "MA": "Massachusetts",
        "MI": "Michigan",
        "MN": "Minnesota",
        "MS": "Mississippi",
        "MO": "Missouri",
        "MT": "Montana",
        "NE": "Nebraska",
        "NV": "Nevada",
        "NH": "New Hampshire",
        "NJ": "New Jersey",
        "NM": "New Mexico",
        "NY": "New York",
        "NC": "North Carolina",
        "ND": "North Dakota",
        "MP": "Northern Mariana Islands",
        "OH": "Ohio",
        "OK": "Oklahoma",
        "OR": "Oregon",
        "PW": "Palau",
        "PA": "Pennsylvania",
        "PR": "Puerto Rico",
        "RI": "Rhode Island",
        "SC": "South Carolina",
        "SD": "South Dakota",
        "TN": "Tennessee",
        "TX": "Texas",
        "UT": "Utah",
        "VT": "Vermont",
        "VI": "Virgin Islands",
        "VA": "Virginia",
        "WA": "Washington",
        "WV": "West Virginia",
        "WI": "Wisconsin",
        "WY": "Wyoming"
      }
    };
  }

  getData = async (query, page, pageSize) => {
    if(cancel){
      cancel();
    }
    // const { pages, pageSize } = this.state;
    const response = await axios.get(`${API_URL}/users/data?query=${query ? JSON.stringify(query) : JSON.stringify(query)}&cache=120`, {
      headers: {authorization: localStorage.getItem('token')},
      cancelToken: new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancel = c;
      })
    });
    const sortedData = response.data.data && response.data.data.results ? response.data.data.results : [];
    pageSize = sortedData.length >=20 ? pageSize : sortedData.length;
    const data = sortedData.slice(pageSize * page, pageSize * page + pageSize);
    this.setState({
      loading: false,
      products: sortedData,
      results: sortedData.map(item => {
        const address = _.find(item.addresses, {"address_purpose": "LOCATION"});
        const taxonomies = item.taxonomies;
        let tmp = '';
        if(taxonomies){
          taxonomies.map(taxonomie =>
            tmp += `${taxonomie.code} - ${taxonomie.desc},`
          );
        }
        return {
          "NPI Number": item.number,
          "Name": item.basic.name,
          "Credential": item.basic.credential,
          "City/State": `${address.city}, ${address.state}`,
          "Taxonomie": tmp,
        };
      }),
      pages: sortedData ? Math.ceil(sortedData.length/0) : 1
    })
  };
  fetchData = async (state, instance) => {
    const { filter } = this.state;
    filter.limit = state.pageSize;
    filter.skip = state.page *  state.pageSize;
    this.setState({ loading: true });
    await this.getData(filter, state.page, state.pageSize);
    this.setState({ loading: false });
  };
  
  onSubmit = (e, values) => {
    const { searched } = this.state;
    e.preventDefault();
    console.log({e, values});
    const filter = {};
    if(values.number && values.number.length === 10){
      filter.number = values.number;
    }
    if(this.state.activeTab === '1'){
      if(values.first_name && values.first_name.length){
        filter.first_name =  values.first_name.length >= 2 ? `*${values.first_name}*` :  values.first_name;
      }
    
      if(values.last_name && values.last_name.length){
        filter.last_name =  values.last_name.length >= 2 ? `*${values.last_name}*` :  values.last_name;
      }
    }
    else {
      if(values.organization_name && values.organization_name.length){
        filter.organization_name =  values.organization_name.length >= 2 ? `*${values.organization_name}*` :  values.organization_name;
      }
    }
    if(values.city && values.city.length){
      filter.city =  values.city.length >= 2 ? `*${values.city}*` :  values.city;
      filter.address_purpose =  "LOCATION";
    }
    if(values.state && values.state.length){
      filter.state =  values.state;
      filter.address_purpose =  "LOCATION";
    }
    if(values.taxonomy_description && values.taxonomy_description.length){
      filter.taxonomy_description =  values.taxonomy_description.length >= 2 ? `*${values.taxonomy_description}*` :  values.taxonomy_description
    }
    console.log({filter});
    this.setState({
      filter,
      searched: true
    });
    if(searched){
      this.fetchData({
        pageSize: 20,
        page: 0
      })
    }
  
  };
  
  bodyComponent = (tableState) => {
    return(
      <Scrollbars
        className="rt-tbody"
        // renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}
        // renderTrackVertical={props => <div {...props} className="track-vertical" />}
        // renderThumbHorizontal={props => <div {...props} className="thumb-horizontal" />}
        // renderThumbVertical={props => <div {...props} className="thumb-vertical" />}
        // renderTrackVertical={({ style, ...props }) =>
        //   <div {...props} style={{ ...style, backgroundColor: 'blue' }} />
        // }
        // renderView={props => <div {...props} className="view" />}
      >
        {tableState.children}
      </Scrollbars>
    );
  };
  
  toggle = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }
  
  render() {
    const { loading , products, pages, pageSize, searched, activeTab, results} = this.state;
    // const { products } = this.props;
    const isSearchByOrg = activeTab === '1';
    const columns = [
      {
        Header: () => <span>NPI number</span>,
        id: 'npi',
        accessor: 'number',
        filterable:false,
        width: 110,
        minResizeWidth: 10,
        Cell: props => <span className='number'>{props.value}</span>
      },
      {
        Header: 'Name',
        id: 'name',
        accessor: 'basic.first_name',
        filterable:false,
        width: 250,
        minResizeWidth: 10,
        Cell: props => {
          return(
            <span className='number'>
              <Link to={`users/${props.original.number}`}>{`${props.original.basic.name}`}</Link>
            </span>
          )
        }
      },
      {
        Header: 'Credentials',
        accessor: 'basic.credential',
        width: 150,
        minResizeWidth: 10,
        Cell: props => <span className='number'>{props.original.basic.credential}</span>
      },
      {
        Header: 'City/State',
        accessor: 'cityState',
        width: 200,
        minResizeWidth: 10,
        Cell: props => {
          const address = _.find(props.original.addresses, {"address_purpose": "LOCATION"});
          if(address){
  
            return(<span className='number'>{address.city}, {address.state}</span>)
          }
          return(<span className='number'>-</span>)
        }
      },
      {
        Header: 'Taxonomy',
        accessor: 'taxonomy',
        width: 450,
        minResizeWidth: 10,
        Cell: props => {
          const taxonomies = props.original.taxonomies;
          if(taxonomies){
            const tmp = taxonomies.map(taxonomie =>
            <div><p>{taxonomie.code}- {taxonomie.desc}</p></div>
            );
            return(tmp)
          }
          return(<span className='number'>-</span>)
        }
      }
    ];
    return <React.Fragment>
      <header className="intro">
        
        <div className="container">
          <div className="form-container">
            <Row>
              <Col>
                <h2>NPI Lookup Search</h2>
                <hr />
              </Col>
            </Row>
            <AvForm onValidSubmit={this.onSubmit} ref={c => (this.form = c)}>
              <Row>
                <Col md="6" className="text-left">
                  <AvField name="number" label="NPI number" type="text" errorMessage="Invalid NPI" validate={{
                    required: {value: false},
                    pattern: {value: '^[A-Za-z0-9]+$'},
                    minLength: {value: 10},
                    maxLength: {value: 10}
                  }}
                  />
                </Col>
                <Col md="6">
                  <Nav tabs>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === '1' })}
                        onClick={() => { this.toggle('1'); }}
                      >
                        Name
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === '2' })}
                        onClick={() => { this.toggle('2'); }}
                      >
                        Organization
                      </NavLink>
                    </NavItem>
                  </Nav>
                  <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="1">
                      <FormGroup className="text-left">
                        <Row>
                          <Col md="6" className="text-left">
                            <AvField name="first_name"  type="text" placeholder="First Name" />
                          </Col>
                          <Col md="6" className="text-left">
                            <AvField name="last_name"  type="text" placeholder="Last Name" />
                          </Col>
                        </Row>
                      </FormGroup>
                    </TabPane>
                    <TabPane tabId="2">
                      <FormGroup className="text-left">
                        <AvField name="organization_name"  type="text" placeholder="Organization Name" />
                      </FormGroup>
                    </TabPane>
                  </TabContent>
                  
                </Col>
              </Row>
              <Row form>
                <Col md={6}>
                  <Row>
                    <Col md={6} className="text-left">
                      <AvField name="city" label="City"  type="text" placeholder="City" />
                    </Col>
                    <Col md={6} className="text-left">
                      <AvField type="select" name="state" label="State">
                        <option />
                        {
                          _.map(this.state.state, (value, key) => <option value={key}>{value}</option>)
                        }
                      </AvField>
                    </Col>
                  </Row>
                </Col>
                <Col md={6} className="text-left">
                  <AvField name="taxonomy_description" label="Taxonomy"  type="text" placeholder="Taxonomy Desc" />
                </Col>
              </Row>
              
              
              <Button color="primary" type="submit">Search</Button>
              <Button type="reset" className="m-l-15" onClick={() => {this.form && this.form.reset();}}>Reset</Button>
            </AvForm>
          </div>
          
        </div>
        <div className="container">
          {searched && <CSVLink data={results || []} target="_blank" filename={"my-file.csv"} >Export as CSV</CSVLink> }
          {searched &&
          <ReactTable
            manual
            pages={products.length <= 20 ? 1 : pages}
            data={ products }
            columns={ columns }
            loading={loading}
            onFetchData={this.fetchData}
            defaultPageSize={products.length < 20 ? products.length : pageSize}
            className="-striped -highlight"
          />
          }
        </div>
      </header>
    </React.Fragment>;
  }
}

const mapStateToProps = (state) => {
  return {
    me: state.auth.me,
    products: state.system.data || []
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    getdata: (values) => {
      dispatch(getdata(values));
    },
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);

