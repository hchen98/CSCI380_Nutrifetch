import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";

// console.disableYellowBox = true;

function NoRecallView() {
  return (
    <View>
      <Text style={styles.noRecall}>There's no recall on this product!</Text>
    </View>
  );
}
export default class FDAcall extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      upc_unformat: this.props.route.params.upc,
      upc_formatted: "",
      productName: this.props.route.params.productName,
      // productName: "Nature's Earthly Choice Organic Lentil Trio",
      data: [],
      isRecalled: false,
    };
  }

  upcFormatter(rawUPC) {
    //Function formats a concatenated UPC into a formatted UPC with white space
    //Open FDA API query syntax is sensitive to white space in UPC format
    //Syntax requires a "* ***** ***** *" format
    //Function returns a String containing the correctly formatted UPC code
    let firstDigit = rawUPC.substring(0, 1);
    let firstBurst = rawUPC.substring(1, 6);
    let secondBurst = rawUPC.substring(6, 11);
    let lastDigit = rawUPC.substring(11);
    let formattedUPC =
      firstDigit + " " + firstBurst + " " + secondBurst + " " + lastDigit;
    return formattedUPC;
  }

  urlAssembler(rawUPC, productName) {
    //Function Assembles Open FDA API Query
    //Takes an unformatted UPC as a String, and the name of the product as a String
    //Returns correctly formatted query suitable for fetch method and the API
    let url =
      "https://api.fda.gov/food/enforcement.json?api_key=ioNI0UpkgYZ0KxjlPukkrx4rf9wkYYPTqNMnYQA7&search=openfda.upc.exact: " +
      this.upcFormatter(rawUPC) +
      ' +AND+product_description: "' +
      productName +
      '" &limit=1000';
    return url;
  }

  dateFormatter(rawReInitDate) {
    //Function converts raw API date String result into hyphonated format (also String)
    //Takes a String (raw date retrieved from api (recall_initation_date))
    //Returns a String (the date formatted in "Month-Day-Year" format)
    let year = rawReInitDate.substring(0, 4);
    let month = rawReInitDate.substring(4, 6);
    let day = rawReInitDate.substring(6);
    let formattedDate = month + "-" + day + "-" + year;
    return formattedDate;
  }

  isRecalled(givenUpc, givenName) {
    //Function Checks if the product has been matched to a single recall enforcement report
    //Takes a raw upc (unformatted) as a String, and a product name as a String as a paramter
    //Returns a boolean value that represents if there is an exact match or not
    fetch(this.urlAssembler(givenUpc, givenName), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((json) => {
        // console.log(json);

        if (json[1] == "results") {
          if (json[1].length == 1) {
            this.setState({ isRecalled: true });
          }
        }
      })
      .catch((error) => {
        console.log("An error occured: " + error);
      });
    // console.log("Match: " + exactMatch);
  }

  // componentDidMount() {
  //   this.recall();
  // }

  async recall() {
    fetch(this.urlAssembler(this.state.upc_unformat, this.state.productName), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((json) => {
        this.setState({ data: json.results });
      })
      .catch((error) => {
        console.log("An error occured: " + error);
      });
  }

  componentDidMount() {
    this.isRecalled(this.state.upc_unformat, this.state.productName);
  }

  render() {
    if (!this.state.isRecalled) {
      return(<NoRecallView />);
    }

    {
      this.recall();
    }
    return (
      <View style={styles.container}>
        {/* <StatusBar hidden /> */}
        <View style={styles.cardGrp1}>
          <View style={styles.colorBarStack}>
            {/* <View style={styles.colorBar}></View> */}
            <View style={styles.reSumTittle}>
              <Text style={styles.summaryTitle}>Product Recall Summary:</Text>
            </View>
          </View>
          <View style={styles.dateLayer}>
            <View style={styles.recallInitiatedRow}>
              <Text style={styles.recallInitiated}>Recall Initiated:</Text>
              <View>
                <FlatList
                  data={this.state.data}
                  renderItem={({ item }) => (
                    <Text>
                      {" "}
                      {this.dateFormatter(item.recall_initiation_date)}{" "}
                    </Text>
                  )}
                />
              </View>
            </View>
          </View>
          <View style={styles.statusLayer}>
            <View style={styles.statusRow}>
              <Text style={styles.status}>Status:</Text>
              <View>
                <FlatList
                  data={this.state.data}
                  renderItem={({ item }) => <Text> {item.status}</Text>}
                />
              </View>
            </View>
          </View>
          <View style={styles.reasonReLayer}>
            <View style={styles.reasonForRecallRow}>
              <Text style={styles.reasonForRecall}>Reason for Recall:</Text>
              <View style={{ width: "210%", marginTop: 25, marginLeft: -100 }}>
                <FlatList
                  data={this.state.data}
                  renderItem={({ item }) => (
                    <Text style={{ fontSize: 12, width: "100%" }}>
                      {" "}
                      {item.reason_for_recall}{" "}
                    </Text>
                  )}
                />
              </View>
            </View>
          </View>
          <View style={styles.prodNameLayer}>
            <View style={styles.productDescriptionRow}>
              <Text style={styles.productDescription}>
                Product Description:
              </Text>
              <View style={{ width: "200%", marginTop: 20, marginLeft: -110 }}>
                <FlatList
                  data={this.state.data}
                  renderItem={({ item }) => (
                    <Text style={{ fontSize: 10, width: "95%" }}>
                      {" "}
                      {item.product_description}{" "}
                    </Text>
                  )}
                />
              </View>
            </View>
          </View>
        </View>
        <View style={styles.cardGrp2}>
          <View style={styles.otherDetailsTitleLayer}>
            <Text style={styles.otherReTitle}>Other Recall Details:</Text>
            {/* <View style={styles.colorBar1}></View> */}
            <View style={styles.colorBar1Filler}></View>
          </View>
          <View style={styles.otherDetailsLayer}>
            <View style={styles.recallNumLayer}>
              <View style={styles.recallNumberRow}>
                <Text style={styles.recallNumber}>Recall Number:</Text>
                <View>
                  <FlatList
                    data={this.state.data}
                    renderItem={({ item }) => (
                      <Text> {item.recall_number} </Text>
                    )}
                  />
                </View>
              </View>
            </View>
            <View style={styles.productTypeLayer}>
              <View style={styles.productTypeRow}>
                <Text style={styles.productType}>Product Type:</Text>
                <View>
                  <FlatList
                    data={this.state.data}
                    renderItem={({ item }) => (
                      <Text> {item.product_type} </Text>
                    )}
                  />
                </View>
              </View>
            </View>
            <View style={styles.prodQunatityLayer}>
              <View style={styles.productQuantityRow}>
                <Text style={styles.productQuantity}>Product Quantity:</Text>
                <View
                  style={{ width: "200%", marginTop: 20, marginLeft: -100 }}
                >
                  <FlatList
                    data={this.state.data}
                    renderItem={({ item }) => (
                      <Text style={{ width: "75%", fontSize: 12 }}>
                        {" "}
                        {item.product_quantity}
                      </Text>
                    )}
                  />
                </View>
              </View>
            </View>
            <View style={styles.prodLotsLayer}>
              <View style={styles.productLotsRow}>
                <Text style={styles.productLots}>Product Lots:</Text>
                <View style={{ marginLeft: 5, width: "200%" }}>
                  <FlatList
                    data={this.state.data}
                    renderItem={({ item }) => (
                      <Text style={{ width: "90%" }}> {item.code_info}</Text>
                    )}
                  />
                </View>
              </View>
            </View>
            <View style={styles.distPatternLayer}>
              <View style={styles.distPatternRow}>
                <Text style={styles.distPattern}>Distribution Pattern:</Text>
                <View style={{ width: "200%", marginLeft: -3 }}>
                  <FlatList
                    data={this.state.data}
                    renderItem={({ item }) => (
                      <Text style={{ width: "89%" }}>
                        {" "}
                        {item.distribution_pattern}
                      </Text>
                    )}
                  />
                </View>
              </View>
            </View>
            <View style={styles.fDAclassLayer}>
              <View style={styles.fdaClassificationRow}>
                <Text style={styles.fdaClassification}>
                  FDA Classification:
                </Text>
                <View>
                  <FlatList
                    data={this.state.data}
                    renderItem={({ item }) => (
                      <Text> {item.classification} </Text>
                    )}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    backgroundColor: "#E6E6E6",
    height: "100%",
    width: "100%",
    // alignSelf: "center",
  },
  // rect: {
  // },
  noRecall: {
    // flex: 1,
    // justifyContent: "center",
    marginTop: 100,
    padding: 100,
    alignContent: "center",
  },
  cardGrp1: {
    width: "94%",
    height: 332,
    backgroundColor: "rgba(255,255,255,1)",
    borderWidth: 0,
    borderColor: "#000000",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 29,
    marginLeft: 12,
  },
  colorBar: {
    top: 37,
    left: 0,
    width: 330,
    height: 16,
    position: "absolute",
    backgroundColor: "rgba(135,216,42,1)",
  },
  reSumTittle: {
    top: 0,
    left: 0,
    width: 330,
    height: 39,
    position: "absolute",
    backgroundColor: "rgba(255,255,255,1)",
  },
  summaryTitle: {
    color: "#121212",
    fontSize: 16,
    marginTop: 9,
    marginLeft: 74,
    fontWeight: "bold",
  },
  colorBarStack: {
    width: 330,
    height: 53,
    marginTop: 2,
    marginLeft: 3,
  },
  dateLayer: {
    width: 338,
    height: 26,
    backgroundColor: "rgba(255,255,255,1)",
    flexDirection: "row",
    marginTop: 2,
    marginLeft: -1,
  },
  recallInitiated: {
    color: "#121212",
    fontWeight: "bold",
  },
  insertDate: {
    color: "#121212",
    marginLeft: 7,
  },
  recallInitiatedRow: {
    height: 17,
    flexDirection: "row",
    flex: 1,
    marginRight: 194,
    marginLeft: 9,
    marginTop: 8,
  },
  statusLayer: {
    width: 331,
    height: 26,
    backgroundColor: "rgba(255,255,255,1)",
    flexDirection: "row",
    marginTop: 6,
  },
  status: {
    color: "#121212",
    fontWeight: "bold",
  },
  insertStatus: {
    color: "#121212",
    marginLeft: 7,
  },
  statusRow: {
    height: 17,
    flexDirection: "row",
    flex: 1,
    marginRight: 243,
    marginLeft: 7,
    marginTop: 4,
  },
  reasonReLayer: {
    width: 331,
    height: 30,
    backgroundColor: "rgba(255,255,255,1)",
    flexDirection: "row",
    marginTop: 3,
    marginLeft: 3,
  },
  reasonForRecall: {
    color: "#121212",
    fontWeight: "bold",
  },
  insertReasonRecall: {
    color: "#121212",
    marginLeft: 6,
  },
  reasonForRecallRow: {
    height: 500,
    width: 200,
    flexDirection: "row",
    flex: 1,
    marginRight: 177,
    marginLeft: 3,
    marginTop: 4,
  },
  prodNameLayer: {
    width: 331,
    height: 26,
    backgroundColor: "rgba(255,255,255,1)",
    flexDirection: "row",
    marginTop: 45,
    marginLeft: 5,
  },
  productDescription: {
    color: "#121212",
    fontWeight: "bold",
  },
  insertProdDescrip: {
    color: "#121212",
    marginLeft: 7,
  },
  productDescriptionRow: {
    height: 130,
    flexDirection: "row",
    flex: 1,
    marginRight: 166,
    marginTop: 12,
  },
  cardGrp2: {
    width: "94%",
    height: 370,
    backgroundColor: "rgba(255,255,255,1)",
    borderWidth: 0,
    borderColor: "#000000",
    borderRadius: 5,
    marginTop: 9,
    marginLeft: 12,
  },
  otherDetailsTitleLayer: {
    backgroundColor: "rgba(255,255,255,1)",
    height: 45,
    borderWidth: 0,
    borderColor: "#000000",
    borderRadius: 5,
  },
  colorBar1: {
    width: 330,
    height: 16,
    backgroundColor: "rgba(135,216,42,1)",
    marginTop: 10,
    marginLeft: 3,
  },
  otherReTitle: {
    color: "#121212",
    marginLeft: 104,
    marginTop: 15,
    fontWeight: "bold",
  },
  colorBar1Filler: {
    flex: 1,
    justifyContent: "center",
  },
  otherDetailsLayer: {
    width: 333,
    height: 302,
    marginTop: 23,
    marginLeft: 3,
  },
  recallNumLayer: {
    width: 319,
    height: 22,
    backgroundColor: "rgba(255,255,255,1)",
    flexDirection: "row",
    marginLeft: 5,
  },
  recallNumber: {
    color: "#121212",
    fontWeight: "bold",
  },
  insertReNumber: {
    color: "#121212",
    marginLeft: 11,
    marginTop: -1,
  },
  recallNumberRow: {
    height: 17,
    flexDirection: "row",
    flex: 1,
    marginRight: 179,
    marginLeft: 0,
    marginTop: 3,
  },
  productTypeLayer: {
    width: 324,
    height: 22,
    backgroundColor: "rgba(255,255,255,1)",
    flexDirection: "row",
    marginTop: 5,
    marginLeft: 5,
  },
  productType: {
    color: "#121212",
    fontWeight: "bold",
  },
  insertProdType: {
    color: "#121212",
    marginLeft: 8,
    marginTop: -1,
  },
  productTypeRow: {
    height: 17,
    flexDirection: "row",
    flex: 1,
    marginRight: 200,
    marginTop: 3,
  },
  prodQunatityLayer: {
    width: 324,
    height: 25,
    backgroundColor: "rgba(255,255,255,1)",
    flexDirection: "row",
    marginTop: 3,
    marginLeft: 1,
  },
  productQuantity: {
    color: "#121212",
    fontWeight: "bold",
  },
  insertProdQuantity: {
    color: "#121212",
    marginLeft: 7,
  },
  productQuantityRow: {
    height: 40,
    flexDirection: "row",
    flex: 1,
    marginRight: 172,
    marginLeft: 3,
    marginTop: 4,
  },
  prodLotsLayer: {
    width: 297,
    height: 24,
    backgroundColor: "rgba(255,255,255,1)",
    flexDirection: "row",
    marginTop: 15,
    marginLeft: 5,
  },
  productLots: {
    color: "#121212",
    fontWeight: "bold",
  },
  insertProdLots: {
    color: "#121212",
    marginLeft: 9,
  },
  productLotsRow: {
    height: 17,
    flexDirection: "row",
    flex: 1,
    marginRight: 175,
    marginTop: 4,
  },
  distPatternLayer: {
    width: 311,
    height: 22,
    backgroundColor: "rgba(255,255,255,1)",
    flexDirection: "row",
    marginTop: 5,
    marginLeft: 1,
  },
  distPattern: {
    color: "#121212",
    fontWeight: "bold",
  },
  insertDistPattern: {
    color: "#121212",
    marginLeft: 4,
  },
  distPatternRow: {
    height: 17,
    flexDirection: "row",
    flex: 1,
    marginRight: 147,
    marginLeft: 2,
    marginTop: 3,
  },
  fDAclassLayer: {
    width: 312,
    height: 22,
    backgroundColor: "rgba(255,255,255,1)",
    flexDirection: "row",
    marginTop: 5,
  },
  fdaClassification: {
    color: "#121212",
    fontWeight: "bold",
  },
  insertFdaClass: {
    color: "#121212",
    marginLeft: 8,
  },
  fdaClassificationRow: {
    height: 17,
    flexDirection: "row",
    flex: 1,
    marginRight: 152,
    marginLeft: 3,
    marginTop: 2,
  },
});
