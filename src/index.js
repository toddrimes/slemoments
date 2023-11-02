import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AssetSelect from './AssetSelect';
import './index.css';
import { v4 as uuid } from 'uuid';
import {socket} from "./socket";

const getParentValue = (varName) => {
    return false;
};

const topURL = window.location.href;
const isNotTop = topURL.indexOf('brb');

let globalAssetId = isNotTop ? 'peacock_604689' : getParentValue('assetId');
const globalDelaySeconds = isNotTop ? 10 : getParentValue('delay');
const globalUserSSO = isNotTop ? "206463869" : getParentValue('userSSO');
const globalUserName = isNotTop ? "Todd Rimes" : getParentValue('userName');
const globalLaunchDelayMinutes = 0.25;


let updatedList = null;
let hasJoinedARoom = true;

let lastLaunch = 0 - (globalLaunchDelayMinutes * 60 * 1000);

const setAssetId = (selAssetId) => {
    globalAssetId = selAssetId;
};

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed)
    return result;
};

const copy = (source, destination, droppableSource, droppableDestination) => {
    console.log('==> dest', destination);

    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const item = sourceClone[droppableSource.index];

    if (!item.hasOwnProperty("phase")) item.phase = "staged";
    if (!item.hasOwnProperty("timecode")) item.timecode = 9999999999999;

    destClone.splice(droppableDestination.index, 0, { ...item, id: uuid(), isCombineEnabled: true });

    // for socket emit
    updatedList = destClone;

    return destClone;
};

const sortList = (list) => {
    list.map((item, index) => item.currentIndex = index.toString().padStart(2, '0'));
    return list.sort((a, b) => {
        const valueA = a.phase + a.timecode + a.currentIndex;
        const valueB = b.phase + b.timecode + b.currentIndex;
        return valueA.localeCompare(valueB);
    });
};

const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    // for socket emit
    updatedList = destClone;

    return result;
};

const DeadZone = styled.div`
  margin-left: 200px;
  height: 80px;
  padding: 30px;
`;

const ContentId = styled.input`
  width: 150px;
`;

const UserId = styled.input`
  width: 150px;
`;

const Content = styled.div`
  margin-left: 200px;
`;

const Countdown = styled.div`
  float: right;
  border: none;
  text-align: center;
  color: red;
`;

const Item = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  user-select: none;
  padding: 0.5rem;
  margin: 0 0 0.5rem 0;
  align-items: flex-start;
  align-content: flex-start;
  border-radius: 3px;
  background: #fff;
  min-height: 60px;
  max-height: 60px;
  overflow: clip;
  border: 1px ${(props) => (props.isDragging ? 'dashed #4099ff' : 'solid #ddd')};
`;

const Clone = styled(Item)`
  + div {
    display: none !important;
  }
`;

const Handle = styled.div`
  display: flex;
  align-items: center;
  align-content: center;
  user-select: none;
  margin: -0.5rem 0.5rem -0.5rem -0.5rem;
  padding: 0.5rem;
  line-height: 1.5;
  border-radius: 3px 0 0 3px;
  /* background: #fff; */
  border-right: 1px solid #ddd;
  color: #000;
`;

const List = styled.div`
  border: 1px ${(props) => (props.isDraggingOver ? 'dashed #000' : 'solid #ddd')};
  background: #fff;
  padding: 0.5rem 0.5rem 0;
  border-radius: 3px;
  flex: 0 0 150px;
  font-family: sans-serif;
`;

const Delay = styled(List)`
  position: absolute;
  top: 0;
  left: 0;
  height: 80px;
  width: 200px;
`;

const DelayField = styled.input`
  width: 60px;
  text-align: right;
`;

const Kiosk = styled(List)`
  position: absolute;
  top: 80px;
  left: 0;
  bottom: 0;
  width: 200px;
`;

const Container = styled(List)`
  margin: 0.5rem 0.5rem 1.5rem;
  background: #ccc;
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  margin: 0.5rem 0.5rem 1.5rem;
  height: 2em;
  background: #fff;
  font-family: sans-serif;
`;

const LaunchedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  margin: 0.5rem 0.5rem 1.5rem 210px;
  height: 2em;
  background: #fff;
  font-family: sans-serif;
`;

const Notice = styled.div`
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  padding: 0.5rem;
  margin: 0 0.5rem 0.5rem;
  border: 1px solid transparent;
  line-height: 1.5;
  color: #aaa;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  padding: 0.5rem;
  color: #000;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 3px;
  font-size: 1rem;
  cursor: pointer;
`;

const ButtonText = styled.div`
  margin: 0 1rem;
`;

const App = () => {
    console.log("process.env.NODE_ENV is " + process.env.NODE_ENV);
    const [time, setTime] = useState(new Date());
    const [contentId, setContentId] = useState(null);
    const [hasContentId, setHasContentId] = useState(false);
    const [state, setState] = useState({
        lists: { [uuid()]: [] },
        moments: []
    });

    const handleMomentsChange = (newMoments) => {
        setState((prevState) => ({
            ...prevState,
            moments: newMoments,
            lists: { [uuid()]: [] },
        }));
        setTimeout(() => {
            if(newMoments.length > 0) {
                socket.emit('init', globalAssetId);
            }
        }, 1000);
    };

    const handleAssetSelectChange = (selectedAssetId) => {
        console.log('Selected Asset Index in App:', selectedAssetId);

        if (selectedAssetId !== '' && selectedAssetId != null) {
            setHasContentId(true);
            setContentId(selectedAssetId);
            globalAssetId = selectedAssetId;

            fetch(
                `https://momentsapi-tr-0b46d75889bf.herokuapp.com/api/dnoc/assets/${selectedAssetId}/overlay`
            )
                .then((response) => response.json())
                .then((data) => {
                    if (data.moments) {
                        let moments = data.moments.sort((a, b) => a.momentNumber - b.momentNumber);
                        for (let i = 0; i < moments.length; i++) {
                            moments[i].id = moments[i].momentNumber;
                            moments[i].phase = "staged";
                            moments[i].timecode = 9999999999999;
                        }
                        console.log(moments);
                        handleMomentsChange(moments);
                    }
                });
        } else {
            setContentId(null);
            setHasContentId(false);
            setState((prevState) => ({
                ...prevState,
                lists: { [uuid()]: [] },
                items: [],
            }));
        }
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;
        console.log('==> result', result);

        if (result.combine) {
            let targetId = result.combine.draggableId;
            let itemsSourceIndex = result.source.index;
            let sourceObject = state.moments[itemsSourceIndex];
            let listId = Object.keys(state.lists)[0];
            let thisList = state.lists[listId];

            for (let j = 0; j < thisList.length; j++) {
                if (thisList[j].id === targetId) {
                    thisList[j].momentNumber = sourceObject.momentNumber;
                    thisList[j].title = sourceObject.title;
                }
            }

            setState((prevState) => ({
                ...prevState,
                lists: { [listId]: thisList },
            }));

            let payload = {
                userSSO: globalUserSSO,
                userName: globalUserName,
                contentId: contentId,
                lists: { [listId]: thisList }
            }

            if(hasJoinedARoom){
                socket.emit('stateChange', payload);
                console.log('COMBINE stateChange emitted!');
                console.dir(payload);
            }

            return;
        }

        if (!destination) {
            return;
        }

        let updatedList = null;

        switch (source.droppableId) {
            case destination.droppableId:
                console.log("switch01");
                updatedList = reorder(
                    state.lists[source.droppableId],
                    source.index,
                    destination.index
                );
                setState((prevState) => ({
                    ...prevState,
                    lists: {
                        [destination.droppableId]: updatedList
                    },
                }));
                break;
            case 'moments':
                console.log("switch02");
                updatedList = copy(
                    state.moments,
                    state.lists[destination.droppableId],
                    source,
                    destination
                );
                setState((prevState) => ({
                    ...prevState,
                    lists: {
                        [destination.droppableId]: updatedList,
                    },
                }));
                break;
            default:
                console.log("switch03");
                setState(
                    move(
                        state.lists[source.droppableId],
                        state.lists[destination.droppableId],
                        source,
                        destination
                    )
                );
                break;
        }

        let payload = {
            userSSO: globalUserSSO,
            userName: globalUserName,
            contentId: contentId,
            lists: { [destination.droppableId]: updatedList }
        }
        if(hasJoinedARoom) {
            socket.emit('stateChange', payload);
            console.log('INSERT/REORDER stateChange emitted!');
            console.dir(payload);
        }
    };

    const addList = (e) => {
        setState((prevState) => ({
            ...prevState,
            [uuid()]: [],
        }));
    };

    useEffect(() => {

        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        socket.connect();

        // Listen for changes from the server
        socket.on('stateChange', (newState) => {
            // Update your local state with the newState received from the server
            if(newState && globalAssetId===newState._id) {
                setState((prevState) => ({
                    ...prevState,
                    lists: newState.lists
                }));
                console.log('received data from server');
                console.dir(newState);
            }
        });

        // Clean up the socket connection when the component unmounts
        return () => {
            socket.disconnect();
            clearInterval(interval);
        };
    }, []);

    const updateTime = (secondsToAdd) => {
        let currentTime = time;
        let currentTimeMillis = currentTime.getTime();
        let millisecondsToAdd = secondsToAdd * 1000;
        let offsetTimeMillis = currentTimeMillis + millisecondsToAdd;
        let offsetUTCTime = new Date(offsetTimeMillis).toUTCString();

        return { ms: offsetTimeMillis, human: offsetUTCTime };
    };

    const handleTrashClick = (event) => {
        let updatedTime = updateTime(globalDelaySeconds);
        let itemId = event.target.parentNode.getAttribute('data-id');
        if (itemId) {
            let rawIndex = itemId.split(':')[1];
            let listId = Object.keys(state.lists)[0];
            let thisList = state.lists[listId];
            thisList.splice(rawIndex, 1);
            setState((prevState) => ({
                ...prevState,
                lists: { [listId]: thisList },
            }));

            if(hasJoinedARoom){
                let payload = {
                    userSSO: globalUserSSO,
                    userName: globalUserName,
                    contentId: contentId,
                    lists: { [listId]: thisList }
                }
                socket.emit('stateChange', payload);
                console.log('TRASH stateChange emitted!');
                console.dir(payload);
            }
        }
    };

    const handleTriggerClick = (event) => {
        let updatedTime = updateTime(globalDelaySeconds);
        let glds = globalLaunchDelayMinutes * 60 * 1000;

        let nextPossibleLaunch = lastLaunch + glds;
        if (updatedTime.ms >= nextPossibleLaunch) {
            setState((prevState) => ({
                ...prevState,
            }));
            lastLaunch = updatedTime.ms;

            let itemId = event.target.getAttribute('data-id');
            let item = document.getElementById(`${itemId}`);

            item.classList.remove('staged');
            item.classList.add('launched');

            let listId = Object.keys(state.lists)[0];
            let thisList = state.lists[listId];
            let rawItemId = itemId.split(':')[0];
            let rawIndex = itemId.split(':')[1];

            let counter = 0;
            for(let k = 0; k < thisList.length; k++) {
                if (thisList[k].id == rawItemId && counter == rawIndex) {
                    thisList[k].phase = 'launched';
                    thisList[k].isCombineEnabled = true;
                    thisList[k].timecode = updatedTime.ms;
                }
                counter++;
            }

            setState((prevState) => ({
                ...prevState,
                lists: { [listId]: thisList },
            }));

            if(hasJoinedARoom){
                let payload = {
                    userSSO: globalUserSSO,
                    userName: globalUserName,
                    contentId: contentId,
                    lists: { [listId]: thisList }
                }
                socket.emit('stateChange', payload);
                console.log('LAUNCHED stateChange emitted!');
                console.dir(payload);
            }
        } else {
            alert(`No LAUNCH, must be at least ${globalLaunchDelayMinutes} minute(s) apart.`);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {isNotTop && (
                <React.Fragment>
                    <Delay>
                        <div class="logo"></div>
                    </Delay>
                    <DeadZone>
                        <AssetSelect onAssetSelectChange={handleAssetSelectChange} />
                    </DeadZone>
                </React.Fragment>
            )}
            <Droppable droppableId="moments" isDropDisabled={true}>
                {(provided, snapshot) => (
                    <Kiosk ref={provided.innerRef} isDraggingOver={snapshot.isDraggingOver}>
                        <ColumnHeader>E D I T O R I A L</ColumnHeader>
                        {hasContentId &&
                            state.moments.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                        <React.Fragment>
                                            <Item
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                isDragging={snapshot.isDragging}
                                                style={provided.draggableProps.style}>
                                                <div className="ilabel">{item.momentNumber}</div>
                                                <div className="ititle">{item.title}</div>
                                            </Item>
                                            {snapshot.isDragging && (
                                                <Clone>
                                                    <div className="ilabel">{item.momentNumber}</div>
                                                    <div className="ititle">{item.title}</div>
                                                </Clone>
                                            )}
                                        </React.Fragment>
                                    )}
                                </Draggable>
                            ))}
                    </Kiosk>
                )}
            </Droppable>
            <React.Fragment>
                <LaunchedHeader>L A U N C H E D</LaunchedHeader>
                <Content>
                    <div>
                        {Object.keys(state.lists).map((list, i) => {
                            const sortedList = sortList(state.lists[list]);
                            return (
                                <Droppable key={list} droppableId={list} isCombineEnabled>
                                    {(provided, snapshot) => (
                                        <Container
                                            ref={provided.innerRef}
                                            isDraggingOver={snapshot.isDraggingOver}>
                                            {sortedList.length ? (
                                                sortedList.map((item, index) => (
                                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <Item
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                isDragging={snapshot.isDragging}
                                                                style={provided.draggableProps.style}
                                                                id={`${item.id}:${index}`} className={item.phase==='launched' && item.timecode > time.getTime() ? "pending " + item.phase : item.phase}>
                                                                <Handle {...provided.dragHandleProps}>
                                                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                                                        <path
                                                                            fill="currentColor"
                                                                            d="M3,15H21V13H3V15M3,19H21V17H3V19M3,11H21V9H3V11M3,5V7H21V5H3Z"
                                                                        />
                                                                    </svg>
                                                                </Handle>
                                                                <div className={`flex-row cvh`}>
                                                                    <div className="column-1">
                                                                        <div className="cvh">{item.momentNumber}</div>
                                                                    </div>
                                                                    <div className="column-2">
                                                                        <div className="cvh">{item.title}</div>
                                                                    </div>
                                                                    <div className="column-3" id={`timecode:${item.id}:${index}`} data-id={`${item.id}:${index}`}>
                                                                        { item.phase==="launched" ? (
                                                                            <div className="cvh timecode">{new Intl.DateTimeFormat('en-US', {hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(item.timecode)}</div>
                                                                        ) : (
                                                                            <a href="#" className="trigger cvh" data-id={`${item.id}:${index}`} onClick={handleTriggerClick}>LAUNCH</a>
                                                                        )}
                                                                    </div>
                                                                    <div className="column-4"/>
                                                                    <div className="column-5">
                                                                        <a href="#" className="cvh trash" data-id={`${item.id}:${index}`} onClick={handleTrashClick}>
                                                                            <span className="material-symbols-outlined">delete</span>
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </Item>
                                                        )}
                                                    </Draggable>
                                                ))
                                            ) : !provided.placeholder ? (
                                                <Notice>Drop items here</Notice>
                                            ) : null}
                                            {provided.placeholder}
                                        </Container>
                                    )}
                                </Droppable>
                            );
                        })}
                    </div>
                </Content>
            </React.Fragment>
        </DragDropContext>
    );
};

// Put the things into the DOM!
ReactDOM.render(<App />, document.getElementById('root'));
