import React, {useState, useEffect, useCallback} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import {debounce} from 'lodash';
interface toDoModel {
  id: number;
  title: string;
  state: 'to do' | 'doing' | 'completed';
}
const App = () => {
  const [listToDo, setListToDo] = useState<Array<toDoModel>>([]);
  const [toDo, setToDo] = useState<string>('');
  const handler = useCallback(debounce(filter, 1000), []);
  const [load, setLoad] = useState<boolean>(true);

  useEffect(() => {
    setLoad(false);
    loadedDataStorage();
  }, []);

  async function loadedDataStorage() {
    const value = await getItemsStorage();
    if (value !== null) {
      setListToDo(value);
      setLoad(true);
    }
  }
  async function getItemsStorage() {
    const value = await AsyncStorage.getItem('myToDo');
    return value !== null ? JSON.parse(value) : [];
  }

  function filter(titleFilter: string, listToDo: Array<toDoModel>) {
    if (listToDo.length == 0 && titleFilter !== '') {
      return;
    }

    if (titleFilter !== '') {
      const myToDoFilters = listToDo.filter((x: toDoModel) => {
        return x.title.toLowerCase().indexOf(titleFilter.toLowerCase()) > -1;
      });
      setListToDo(myToDoFilters);
    } else {
      loadedDataStorage();
    }
  }

  function onChangeTextToDo(text: string) {
    setToDo(text);
    handler(text, listToDo);
  }
  async function setItem(list: Array<toDoModel>) {
    await AsyncStorage.setItem('myToDo', JSON.stringify(list));
  }

  function onHandleDelete(id: number) {
    try {
      getItemsStorage().then(items => {
        try {
          const list = items.filter((x: toDoModel) => x.id !== id);
          setListToDo(list);
          setItem(list);
        } catch (e) {
          console.log(e);
        }
      });
    } catch (exception) {
      console.log(exception);
    }
  }

  async function onHandleChangeState({
    id,
    state,
  }: {
    id: number;
    state: 'to do' | 'doing' | 'completed';
  }) {
    const values = await getItemsStorage();
    let list = values.map((x: toDoModel) => {
      x.state = x.id === id ? state : x.state;
      return x;
    });
    setListToDo(list);
    setItem(list);
  }

  async function addToDo() {
    if (!toDo) {
      Alert.alert('Preencha o campo');
      return;
    }
    const date = new Date();
    const myToDo: toDoModel = {
      id: date.getTime(),
      title: toDo,
      state: 'to do',
    };
    getItemsStorage().then(items => {
      const list = [...items, myToDo];
      setListToDo(list);
      setItem(list);
      onChangeTextToDo('');
    });
  }

  return (
    <SafeAreaView>
      <StatusBar barStyle="light-content" />
      {!load && <ActivityIndicator />}
      {load && (
        <View style={styles.container}>
          <View style={styles.sectionContainer}>
            <Text style={styles.title}>O que tem para hoje?</Text>
            <View style={styles.sectionInput}>
              <TextInput
                onChangeText={text => onChangeTextToDo(text)}
                value={toDo}
                style={styles.inputText}
                placeholder="Insira sua tarefa"
              />
              <Icon.Button
                onPress={addToDo}
                name="add"
                backgroundColor="#5548c2"
                size={32}
              />
            </View>
          </View>
          <FlatList
            data={listToDo}
            keyExtractor={item => String(item.id)}
            ListEmptyComponent={() => (
              <View style={styles.containerEmpty}>
                <Text> No momento você está ocioso.</Text>
              </View>
            )}
            renderItem={({item}) => (
              <View style={styles.item} key={item.id}>
                <View>
                  <Text style={styles.titleToDo}>{item.title}</Text>
                  <Text style={styles.subTitle}>{item.state}</Text>
                </View>
                <View style={styles.itemIcon}>
                  {item.state === 'to do' && (
                    <Icon.Button
                      style={styles.icon}
                      onPress={() =>
                        onHandleChangeState({id: item.id, state: 'doing'})
                      }
                      name="play-arrow"
                      backgroundColor="#5548c2"
                      size={18}
                    />
                  )}
                  {item.state === 'doing' && (
                    <Icon.Button
                      onPress={() =>
                        onHandleChangeState({id: item.id, state: 'to do'})
                      }
                      style={styles.icon}
                      name="pause-circle-outline"
                      backgroundColor="#5548c2"
                      size={18}
                    />
                  )}
                  {item.state === 'doing' && (
                    <Icon.Button
                      style={styles.icon}
                      onPress={() =>
                        onHandleChangeState({
                          id: item.id,
                          state: 'completed',
                        })
                      }
                      name="done"
                      backgroundColor="#5548c2"
                      size={18}
                    />
                  )}
                  <Feather.Button
                    style={styles.icon}
                    onPress={() => onHandleDelete(item.id)}
                    name="trash"
                    backgroundColor="#5548c2"
                    size={18}
                  />
                </View>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  sectionContainer: {
    width: '100%',
    paddingVertical: '10%',
    paddingHorizontal: '5%',
    backgroundColor: '#5548c2',
    borderBottomRightRadius: 50,
  },
  icon: {
    display: 'flex',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  sectionInput: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#5548c2',
    borderBottomRightRadius: 50,
    alignItems: 'center',
  },
  add: {
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    backgroundColor: '#594ccd',
    elevation: 2, // Android
  },
  inputText: {
    width: '80%',
    paddingLeft: '5%',
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: ' #cecece',
  },
  item: {
    paddingVertical: '5%',
    paddingHorizontal: '5%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#dedbdb',
    borderBottomWidth: 2,
  },
  itemIcon: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 10,
    textAlign: 'center',
    minWidth: '50%',
  },
  title: {
    paddingBottom: '4%',
    color: '#fff',
    fontSize: 18,
  },
  titleToDo: {
    color: '#000000',
    fontSize: 18,
  },
  subTitle: {
    color: '#cecece',
    fontSize: 14,
  },
  containerEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 500,
  },
});

export default App;
