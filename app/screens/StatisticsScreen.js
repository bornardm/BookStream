import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  RefreshControl,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { Dropdown } from "react-native-element-dropdown";

import { colors } from "../constants/Colors";
import {
  getStatsStatusDB,
  getStatsAuthorsDB,
  getNumberBooksReadDB,
  getNumberPagesReadDB,
  getNumberBooksReadByMonthDB,
  getNumberBooksReadByYearDB,
  getAverageNumberOfDaystoReadDB,
  getDistinctYearDB,
  getTopRatedBooksDB,
} from "../requests";
import { getBookStatusProps } from "../constants/BookStatus";
import LoadingView from "../components/LoadingView";
import BookPreview from "../components/BookPreview";
import i18next from "../localization/i18n";
import { useTranslation } from "react-i18next";

const chartConfig = {
  backgroundGradientFrom: "#03DAC6",
  backgroundGradientFromOpacity: 0.3,
  backgroundGradientTo: "#03DAC6",
  backgroundGradientToOpacity: 1,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
  statusStats.forEach((statElement) => {
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
  const { t } = useTranslation();
  const months = [
    t("screens.statistics.months.january"),
    t("screens.statistics.months.february"),
    t("screens.statistics.months.march"),
    t("screens.statistics.months.april"),
    t("screens.statistics.months.may"),
    t("screens.statistics.months.june"),
    t("screens.statistics.months.july"),
    t("screens.statistics.months.august"),
    t("screens.statistics.months.september"),
    t("screens.statistics.months.october"),
    t("screens.statistics.months.november"),
    t("screens.statistics.months.december"),
  ];

  const [barChartData, setBarChartData] = useState(null);
  const [period, setPeriod] = useState(null);
  const [statsLoaded, setStatsLoaded] = useState(false);

  const [distinctYear, setDistinctYear] = useState(
    getDistinctYearDB({ end: true })
  );
  const [dropdownData, setDropdownData] = useState([]);
  const [dropdownValue, setDropdownValue] = useState("");
  const [statusStats, setStatusStats] = useState([]);
  const [authorsStats, setAuthorsStats] = useState([]);

  const [numberBooksRead, setNumberBooksRead] = useState(0);
  const [numberPagesRead, setNumberPagesRead] = useState(0);
  const [averageNumberOfDaystoRead, setAverageNumberOfDaystoRead] = useState(0);
  const [topRatedBooks, setTopRatedBooks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshIndex(refreshIndex + 1);
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [refreshIndex]);

  function computeBarChartData() {
    let data = {};
    if (period === null) {
      let years = [];
      for (
        let i = distinctYear[distinctYear.length - 1];
        i <= distinctYear[0];
        i++
      ) {
        years.push(i);
      }
      data.labels = years;
      data.datasets = [
        {
          data: Array(years.length).fill(0),
        },
      ];
      const dbData = getNumberBooksReadByYearDB();
      dbData.forEach((element) => {
        data.datasets[0].data[element.year - years[0]] = element.count;
      });
    } else {
      data.labels = months;
      data.datasets = [
        {
          data: Array(12).fill(0),
        },
      ];
      const dbData = getNumberBooksReadByMonthDB({ year: period });
      dbData.forEach((element) => {
        data.datasets[0].data[parseInt(element.month) - 1] = element.count;
      });
    }
    console.log("BarChartData = ", data, data.datasets[0].data);
    return data;
  }
  useEffect(() => {}, [refreshIndex]);
  useEffect(() => {
    const fetchData = async () => {
      const distinctYearData = getDistinctYearDB({ end: true });
      setDistinctYear(distinctYearData);

      const dropdownData = [
        { label: "all years", value: t("screens.statistics.allYears") },
        ...distinctYearData.map((year) => {
          return { label: year, value: year };
        }),
      ];
      setDropdownData(dropdownData);
      setDropdownValue(dropdownData[0].label);

      const statusStatsData = computeStatusStats(getStatsStatusDB());
      setStatusStats(statusStatsData);

      const authorsStatsData = getStatsAuthorsDB().slice(0, 10);
      setAuthorsStats(authorsStatsData);
    };

    fetchData();
  }, [refreshIndex]);

  useEffect(() => {
    setBarChartData(computeBarChartData());
    setNumberBooksRead(getNumberBooksReadDB({ year: period }));
    setNumberPagesRead(getNumberPagesReadDB({ year: period }));
    setAverageNumberOfDaystoRead(
      getAverageNumberOfDaystoReadDB({ year: period })
    );
    setTopRatedBooks(getTopRatedBooksDB({ year: period, limit: 5 }));
    setStatsLoaded(true);
  }, [period, refreshIndex]);

  if (!statsLoaded) {
    return <LoadingView white={true} />;
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
        <View
          style={[
            styles.statsContainer,
            { backgroundColor: "rgba(3,218,198, 0.3)" },
          ]}
        >
          <View style={styles.dropdownContainer}>
            <Text style={[styles.statsTitle, { marginRight: 5 }]}>
              {t("screens.statistics.statisticsOf")}
            </Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={[
                styles.statsTitle,
                { marginBottom: 0, marginLeft: 5 },
              ]}
              data={dropdownData}
              maxHeight={300}
              labelField="label"
              valueField="value"
              value={dropdownValue}
              onChange={(item) => {
                if (item.label === "all years") {
                  setPeriod(null);
                } else {
                  setPeriod(item.value);
                }
                setDropdownValue(item.label);
              }}
            />
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={[styles.smallStatsContainer, { marginLeft: 0 }]}>
              <Text style={styles.statsImportantInfos}>{numberBooksRead}</Text>
              <Text style={styles.statsImportantInfos}>
                {t("screens.statistics.booksRead")}
              </Text>
            </View>
            <View style={[styles.smallStatsContainer, { marginRight: 0 }]}>
              <Text style={styles.statsImportantInfos}>{numberPagesRead}</Text>
              <Text style={styles.statsImportantInfos}>
                {t("screens.statistics.pagesRead")}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={[styles.smallStatsContainer, { marginHorizontal: 0 }]}>
              <Text style={styles.statsImportantInfos}>
                {averageNumberOfDaystoRead}
              </Text>
              <Text style={styles.statsImportantInfos}>
                {t("screens.statistics.averageDaysToRead")}
              </Text>
            </View>
          </View>
          <ScrollView horizontal={true}>
            <BarChart
              data={barChartData}
              width={400}
              height={420}
              chartConfig={chartConfig}
              verticalLabelRotation={90}
              style={styles.barChart}
              fromZero={true}
            />
          </ScrollView>
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>
              {t("screens.statistics.topRatedBooks")}
            </Text>
            <ScrollView style={styles.previewScrollView} horizontal={true}>
              {topRatedBooks.map((book, index) => (
                <View key={index} style={styles.bookPreview}>
                  <BookPreview
                    key={index}
                    bookID={book.bookID}
                    title={book.title}
                    author={book.author}
                    rating={book.rating}
                    status={book.status}
                    imageName={book.imageName}
                    touchable={false}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <Text style={[styles.statsTitle, { marginBottom: 0 }]}>
            {t("screens.statistics.booksStatus")}
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
          <Text style={styles.statsTitle}>
            {t("screens.statistics.top10Authors")}
          </Text>
          {authorsStats.map((author, index) => (
            <RowAuthor
              key={index}
              rank={index + 1}
              author={author.author}
              count={author.count}
            />
          ))}
        </View>
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
  smallStatsContainer: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-around",
    margin: 5,
    flex: 1,
  },
  barChart: {
    borderRadius: 10,
    margin: 5,
    alignSelf: "center",
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
  statsImportantInfos: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
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

  // MultiSelect styles
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 5,
    height: 50,
  },
  dropdown: {
    height: 40,
    backgroundColor: colors.white,
    width: 120,
    borderRadius: 10,
    padding: 5,
    margin: 0,
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 12,
  },
  previewScrollView: {
    width: "100%",
    backgroundColor: "transparent",
  },
  bookPreview: {
    margin: 5,
    backgroundColor: colors.white,
    borderRadius: 10,
    minWidth: 300,
  },
});
