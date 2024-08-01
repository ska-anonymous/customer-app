import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';

export default function App() {
  const db = SQLite.openDatabase('customers.db');

  const [isLoading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [currentCustomerName, setCurrentCustomerName] = useState('');

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');
    });

    db.transaction(tx => {
      const SuccessLoadingCustomersCB = (txObj, resultSet) =>
        setCustomers(resultSet.rows._array);

      const errorLoadingCustomersCB = (txObj, error) =>
        console.log('Error, ', error);

      tx.executeSql(
        'SELECT * FROM customers', // SQL Statement
        null,                      // Args
        SuccessLoadingCustomersCB, // Success callback
        errorLoadingCustomersCB    // Error callback
      );
    });

    setLoading(false);
  }, []);

  const deleteCustomer = (customerId) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM customers WHERE id = ?',
        [customerId],
        (txObj, resultSet) => {
          // Customer deleted successfully
          // You may want to update the customers list here
          const updatedCustomers = customers.filter(
            (customer) => customer.id !== customerId
          );
          setCustomers(updatedCustomers);
        },
        (txObj, error) => console.log('Error', error)
      );
    });
  };


  const showCustomers = () =>
    customers.map((customer, index) => (
      <View key={index} style={styles.row}>
        <Text>{customer.name}</Text>
        <Button
          title="Delete"
          onPress={() => deleteCustomer(customer.id)}
        />
      </View>
    ));


  const addCustomer = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO customers (name) VALUES (?)',
        [currentCustomerName],
        (txObj, resultSet) => {
          const { insertId } = resultSet;
          const newCustomer = { id: insertId, name: currentCustomerName };
          const updatedCustomers = [...customers, newCustomer];
          setCustomers(updatedCustomers);
          setCurrentCustomerName('');
        },
        (txObj, error) => console.log('Error', error)
      );
    });
  };

  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text>Customers APP</Text>

      <TextInput
        placeholder='Customer name'
        value={currentCustomerName}
        onChangeText={setCurrentCustomerName}
      />
      <Button
        title='Submit'
        onPress={addCustomer}
      />

      {showCustomers()}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-between',
    margin: 10
  }
});
