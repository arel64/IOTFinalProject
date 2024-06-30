import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as SignalR from '@microsoft/signalr';

export default function App() {
  const [counter, setCounter] = useState(null);
  const [connection, setConnection] = useState(null);
  const url = "https://iotex02-arel-dev.azurewebsites.net/api";
  //const url = "http://localhost:7071/api";

  useEffect(() => {
    const signalrConnection = new SignalR.HubConnectionBuilder()
      .withUrl(url, {
        withCredentials: false,
        transport: SignalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(SignalR.LogLevel.Information)
      .build();

    signalrConnection.on('newCountUpdate', (message) => {
      console.log('New count:', message);
      setCounter(parseInt(message));
    });

    signalrConnection.onclose(() => {
      console.log('Connection closed.');
    });

    setConnection(signalrConnection);

    const startConnection = async () => {
      try {
        await signalrConnection.start();
        console.log('SignalR connected.');
        setConnection(signalrConnection);
      } catch (err) {
        console.log('SignalR connection error:', err);
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();
  }, []);

  useEffect(() => {
    const readCounter = () => {

      fetch(url + "/ReadCounter", {
        method: 'GET',
      }).then((response) => {
        return response.text();
      }).then((text) => {
        setCounter(parseInt(text));
      }).catch(
        (error) => { console.error(error); }
      );
    };

    readCounter();
  }, []);

  const increaseCounter = () => {
    fetch(url + "/IncreaseCounter", {
      method: 'GET',
    }).then((response) => {
      return response.text();
    }).then((text) => {
      setCounter(parseInt(text));
    }).catch(
      (error) => { console.error(error); }
    );
  };

  const decreaseCounter = () => {
    fetch(url + "/DecreaseCounter", {
      method: 'GET',
    }).then((response) => {
      return response.text();
    }).then((text) => {
      setCounter(parseInt(text));
    }).catch(
      (error) => { console.error(error); }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.counterText}>Counter: {counter}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Increase" onPress={increaseCounter} />
        <Button title="Decrease" onPress={decreaseCounter} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  counterText: {
    fontSize: 32,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
  },
});
