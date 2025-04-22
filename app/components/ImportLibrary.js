// React and React Native components and hooks
import React, { useEffect, useState, useContext } from "react";
import {
    Alert,
    Button,
    Modal,
    Image,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
    TouchableHighlight,
    ToastAndroid,
} from "react-native";
import ReloadContext from "../reloadContext";
import { checkDbStructure } from "../requests";
import { getDBconnexion, replaceDB } from "../setupDatabase";
import { getDocumentAsync } from "expo-document-picker";
import * as SQLite from "expo-sqlite";

// Third-party libraries/components
import * as FileSystem from "expo-file-system";

// Utility functions, constants, and other local imports
import { colors } from "../constants/Colors";
import ButtonGroup from "./ButtonGroup";
import { use } from "i18next";

const { StorageAccessFramework } = FileSystem;

const checkButtonProps = {
    selectedColor: "blue",
    unselectedColor: colors.middleLightGrey,
    size: 17,
    selected: false,
};
const importOptions = [
    {
        id: 1,
        label: "Import library from bookStreamDB.db (your current library is going to be erased by the imported one)",
        value: "db",
        ...checkButtonProps,
        selected: true,
    },
    {
        id: 2,
        label: "...TODO",
        value: "json...TODO",
        ...checkButtonProps,
    },
    {
        id: 3,
        label: "...TODO",
        value: "csv..TODO",
        ...checkButtonProps,
    },
];

export default function ImportLibrary({ visible, setIsVisible }) {
    const [importOptionsData, setImportOptionsData] = useState(importOptions);
    const [pickedFileInfos, setPickedFileInfos] = useState(null);
    const { reloadApp } = useContext(ReloadContext);

    const handlePressImport = () => {
        if (importOptionsData[0].selected) {
            console.log("TODO import .db and verify the format");
            pickFile();
        }
        if (importOptionsData[1].selected) {
            console.log("TODO ");
        }
        if (importOptionsData[2].selected) {
            // export csv
            console.log("TODO");
        }
        //setIsVisible(false); //TODO put this line when all the imports are done
    };

    const pickFile = async () => {
        try {
            const result = await getDocumentAsync({
                type: "application/*", // Allow application files only
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                console.log("User canceled the file picker");
                return;
            }

            console.log("Selected file:", result);

            // Check if the file is a database
            const regexpFileName = /bookStreamDB(?:\(\d+\))?\.db/;
            if (!regexpFileName.test(result.assets[0].name)) {
                Alert.alert(
                    "Invalid file",
                    "The selected file is not a valid database file. Please select a valid database file (.db). The file must be named 'bookStreamDB.db'."
                );
                return;
            }

            // Get file details
            console.log(
                "File uri:",
                result.assets[0].uri,
                typeof result.assets[0].uri
            );
            setPickedFileInfos({
                uri: result.assets[0].uri,
                name: result.assets[0].name,
            });
        } catch (error) {
            console.error("Error picking file:", error);
        }
        console.log("File picked");
    };

    useEffect(() => {
        const verifyDatabase = async () => {
            if (pickedFileInfos !== null) {
                let connexion; //connection to the imported database
                try {
                    connexion = await getDBconnexion(pickedFileInfos.uri);
                    console.log("Database connected successfully");
                } catch (error) {
                    console.error("Error connecting to the database", error);
                    Alert.alert(
                        "Error when loading the database. Please retry."
                    );
                    return;
                }
                console.log("aaaa");
                if (checkDbStructure(connexion)) {
                    try {
                        replaceDB();
                    } catch (error) {
                        console.error("Error replacing the database", error);
                        Alert.alert(
                            "Error when replacing the database. Please retry."
                        );
                        return;
                    }
                    reloadApp();
                    setIsVisible(false);
                } else {
                    Alert.alert(
                        "The database is not compatible with the app. Please retry with a database exported from the app."
                    );
                }
            }
        };

        console.log("Picked file uri", pickedFileInfos); //TODO not called
        verifyDatabase();
    }, [pickedFileInfos]);

    const handlePressCheckButton = (id) => {
        const newExportOptions = importOptionsData.map((item) => {
            if (item.id === id) {
                return {
                    ...item,
                    selected: !item.selected,
                };
            }
            return item;
        });
        setImportOptionsData(newExportOptions);
    };
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={() => {
                setIsVisible(false);
            }}
        >
            <TouchableWithoutFeedback
                onPress={() => {
                    setIsVisible(false);
                }}
            >
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.popup}>
                            <View>
                                <ButtonGroup
                                    type="check"
                                    buttonsData={importOptionsData}
                                    selected={1}
                                    onPress={handlePressCheckButton}
                                    containerStyle={styles.buttonGroupContainer}
                                />
                            </View>
                            <View style={styles.bootomButtons}>
                                <TouchableHighlight
                                    style={styles.button}
                                    underlayColor={colors.underlayColor}
                                    onPress={() => setIsVisible(false)}
                                >
                                    <Text style={styles.buttonText}>
                                        Cancel
                                    </Text>
                                </TouchableHighlight>
                                <TouchableHighlight
                                    style={styles.button}
                                    underlayColor={colors.underlayColor}
                                    onPress={handlePressImport}
                                >
                                    <Text style={styles.buttonText}>
                                        Import
                                    </Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    popup: {
        width: "90%",
        padding: 20,
        paddingVertical: 30,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "space-between",
    },
    buttonGroupContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
        marginBottom: 15,
    },
    bootomButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    buttonText: {
        fontSize: 16,
        color: "deepskyblue",
        fontWeight: "bold",
    },
    button: {
        padding: 10,
        margin: 10,
        borderRadius: 5,
    },
});
