import React from "react";
import { View, Text, StyleSheet, Button, ScrollView } from "react-native";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";

import { colors } from "../constants/Colors";
import {
  getStatsStatusDB,
  getStatsAuthorsDB,
  getNumberBooksReadDB,
  getNumberPagesReadDB,
  getNumberBooksReadByMonthDB,
  getNumberBooksReadByYearDB,
} from "../requests";
import { getBookStatusProps } from "../constants/BookStatus";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
const chartConfig = {
  backgroundGradientFrom: "#1E2923",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#08130D",
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false, // optional
};
const legendFontColor = "#7F7F7F";
const legendFontSize = 15;

const data = [
  {
    name: "Seoul",
    population: 21500000,
    color: "rgba(131, 167, 234, 1)",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Toronto",
    population: 2800000,
    color: "#F00",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Beijing",
    population: 527612,
    color: "red",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "New York",
    population: 8538000,
    color: "#ffffff",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Moscow",
    population: 11920000,
    color: "rgb(0, 0, 255)",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
];

const computeStatusStats = (statusStats) => {
  if (!statusStats) {
    return [];
  }
  let data = [];
  const bookStatusProps = getBookStatusProps();
  console.log(statusStats);
  statusStats.forEach((statElement) => {
    console.log("Element = ", statElement);
    data.push({
      name: bookStatusProps[statElement.status].text,
      number: statElement.count,
      color: bookStatusProps[statElement.status].color,
      legendFontColor: legendFontColor,
      legendFontSize: legendFontSize,
    });
  });
  return data;
};

const RowLegend = ({ text, color }) => {
  return (
    <View style={styles.rowLegend}>
      <View
        style={{
          width: 15,
          height: 15,
          borderRadius: 8,
          backgroundColor: color,
          marginRight: 10,
        }}
      />
      <Text>{text}</Text>
    </View>
  );
};

const RowAuthor = ({ rank, author, count }) => {
  return (
    <View style={styles.rowAuthor}>
      <Text style={styles.rank}>{rank}</Text>
      <Text style={styles.author}>{author}</Text>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
};

export default function StatisiticsScreen() {
  const statusStats = computeStatusStats(getStatsStatusDB());
  console.log("StatusStats = ", statusStats);
  const authorsStats = getStatsAuthorsDB().slice(0, 10);
  console.log("AuthorsStats = ", authorsStats);
  const numberBooksRead = getNumberBooksReadDB();
  console.log("NumberBooksRead = ", numberBooksRead);
  const numberPagesRead = getNumberPagesReadDB({ year: 2024 });
  console.log("NumberPagesRead = ", numberPagesRead);
  const numberBooksReadByMonth = getNumberBooksReadByMonthDB({ year: 2024 });
  console.log("NumberBooksReadByMonth = ", numberBooksReadByMonth);
  const numberBooksReadByYear = getNumberBooksReadByYearDB();
  console.log("NumberBooksReadByYear = ", numberBooksReadByYear);
  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.statsContainer}>
          <Text style={[styles.statsTitle, { marginBottom: 0 }]}>
            Books status
          </Text>
          <View style={styles.pieChart}>
            <PieChart
              data={statusStats}
              height={200}
              width={200}
              chartConfig={chartConfig}
              accessor={"number"}
              backgroundColor={"transparent"}
              center={[30, 0]}
              hasLegend={false}
            />
            <View style={{ marginLeft: 10 }}>
              {statusStats.map((stat, index) => (
                <RowLegend
                  key={index}
                  text={`${stat.name} (${stat.number})`}
                  color={stat.color}
                />
              ))}
            </View>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Top 10 authors</Text>
          {authorsStats.map((author, index) => (
            <RowAuthor
              key={index}
              rank={index + 1}
              author={author.author}
              count={author.count}
            />
          ))}
        </View>
        <Text>Nombre de pages lues</Text>
        <Text>Nombre de livres lus</Text>
        <Text>Nombre de jours moyens pour lire un livres</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  pieChart: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowLegend: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  rowAuthor: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#f9f9f9",
    marginBottom: 5,
    borderRadius: 5,
  },
  rank: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  author: {
    flex: 3,
    textAlign: "center",
  },
  count: {
    flex: 1,
    textAlign: "center",
  },
});
