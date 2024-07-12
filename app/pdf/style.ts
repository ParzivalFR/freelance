import { StyleSheet } from "@react-pdf/renderer";

export const PDFStyle = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    lineHeight: 1.2,
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    // alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "2px solid #000",
  },
  logo: {
    width: 160,
    height: 60,
  },
  companyDetails: {
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    width: "50%",
    border: "1px solid #000",
    padding: 6,
    borderRadius: 10,
  },
  companyAdress: {
    textAlign: "right",
  },
  infoText: {
    marginBottom: 5,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textDecoration: "underline",
    marginBottom: 5,
  },
  infoContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  clientInfo: {
    flex: 1,
    textAlign: "center",
    marginRight: 10,
    border: "1px solid #000",
    padding: 10,
    borderRadius: 5,
  },
  invoiceInfo: {
    flex: 1,
    textAlign: "center",
    border: "1px solid #000",
    padding: 10,
    borderRadius: 5,
  },
  tableHeader: {
    backgroundColor: "#a5a5a5",
    flexDirection: "row",
    padding: 5,
    borderBottom: "1px solid #000",
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: "row",
    marginBottom: 5,
    padding: 5,
  },
  tableCol: {
    width: "20%",
    textAlign: "right",
  },
  tableBackground: {
    backgroundColor: "#f9f9f9",
    textAlign: "center",
  },
  tableColDesc: {
    width: "40%",
    textAlign: "left",
  },
  footer: {
    paddingTop: 10,
    borderTop: "2px solid #000",
    textAlign: "center",
  },
  footerText: {
    fontSize: 10,
  },
  qrCode: {
    position: "relative",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  qrContent: {
    // maxWidth: "300px",
    width: "100%",
    position: "absolute",
    left: 100,
    bottom: -20,
    fontSize: 10,

    // display: "flex",
    // flexDirection: "column",
    // justifyContent: "flex-end",
    // alignItems: "flex-end",
    // textAlign: "right",
    // padding: 10,
  },
  qrImage: {
    width: 120,
  },
  link: {
    color: "#000",
    textDecoration: "underline",
  },
});
