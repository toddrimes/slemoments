import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid/v4';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AssetSelect from './AssetSelect';
import './index.css';

// Placeholder
const getParentValue = (varName) => {
    return false;
};
const topURL = window.location.href;
const isNotTop = topURL.indexOf('brb');

const globalAssetId = isNotTop ? getParentValue('assetId') : 'peacock_604689';
const globalDelay = isNotTop ? getParentValue('delay') : 8;
// const globalLaunchDelayMinutes = isNotTop ? getParentValue('launchDelayMinutes') : 1;
const globalLaunchDelayMinutes = 0.25;
const globalUserId = isNotTop ? getParentValue('userId') : '206463869';

const setAssetId = (selAssetId) => {
    this.globalAssetId = selAssetId;
};

// A little function to help with reordering the result
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

/**
 * Moves an item from one list to another list.
 */
const copy = (source, destination, droppableSource, droppableDestination) => {
    console.log('==> dest', destination);

    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const item = sourceClone[droppableSource.index];

    destClone.splice(droppableDestination.index, 0, { ...item, id: uuid() });
    return destClone;
};

const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

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
  display: flex;
  justify-content: space-between;
  user-select: none;
  padding: 0.5rem;
  margin: 0 0 0.5rem 0;
  align-items: flex-start;
  align-content: flex-start;
  border-radius: 3px;
  background: #fff;
  border: 1px
  ${(props) => (props.isDragging ? 'dashed #4099ff' : 'solid #ddd')};
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
  background: #fff;
  border-right: 1px solid #ddd;
  color: #000;
`;

const List = styled.div`
  border: 1px
  ${(props) => (props.isDraggingOver ? 'dashed #000' : 'solid #ddd')};
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
  color: #aaa
  margin: 0.5rem 0.5rem 1.5rem;
  height: 2em;
  background: #fff;
  font-family: sans-serif;
`;

const LaunchedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa
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
  margin: 0.5rem;
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

let ITEMS = [
    {
        id: uuid(),
        content: 'Moment 1',
    },
    {
        id: uuid(),
        content: 'Moment 2'
    },
    {
        id: uuid(),
        content: 'Moment 3'
    },
    {
        id: uuid(),
        content: 'Moment 4'
    },
    {
        id: uuid(),
        content: 'Moment 5'
    }
];

class App extends Component {
    constructor(props) {
        super(props);
        this.contentId = null;
        this.hasContentId = this.contentId != null;
        this.state = {
            lists: { [uuid()]: [] },
            moments: ITEMS,
            lastLaunch: 0
        };
    }

    handleMomentsChange = (newMoments) => {
        this.setState({moments: newMoments});
        this.setState({lists: { [uuid()]: [] }});
    }

    handleAssetSelectChange = (selectedAssetId) => {
        // You can access the selectedAssetIndex value here and use it in the App component
        console.log('Selected Asset Index in App:', selectedAssetId);
        // Perform any further actions or state updates in App based on the selected value.
        if (selectedAssetId !== '' && selectedAssetId != null) {
            this.hasContentId = true;
            this.setState({contentId:  selectedAssetId});
            let currentThis = this;
            fetch(
                `https://momentsapi-tr-0b46d75889bf.herokuapp.com/api/dnoc/assets/${selectedAssetId}/overlay`
            )
                .then((response) => response.json())
                .then((data) => {
                    if(data.moments){
                        let moments = data.moments.sort((a,b) => a.momentNumber-b.momentNumber);
                        for (let i = 0; i < moments.length; i++) {
                            moments[i].id = moments[i].momentNumber;
                            // moments[i].content = `<label>Moment ${moments[i].momentNumber}</label><title>${moments[i].title}</title>`;
                        }
                        ITEMS = moments;
                        console.log(moments);
                        this.handleMomentsChange(moments);
                    }
                });
        } else {
            this.hasContentId = false;
            this.setState({ lists: { [uuid()]: [] } });
            this.setState({ items: [] });
        }
        // this.forceUpdate();
    };

    onDragEnd = (result) => {
        const { source, destination } = result;

        console.log('==> result', result);

        // Dropped outside the list
        if (!destination) {
            return;
        }

        switch (source.droppableId) {
            case destination.droppableId:
                // Debugger;
                this.setState({
                    [destination.droppableId]: reorder(
                        this.state.lists[source.droppableId],
                        source.index,
                        destination.index
                    )
                });
                break;
            case 'ITEMS':
                // Debugger;
                if (
                    this.state.lists[destination.droppableId].length &&
                    destination.index !=
                    this.state.lists[destination.droppableId].length
                )
                    break;
                this.setState({
                    lists: {
                        [destination.droppableId]: copy(
                            ITEMS,
                            this.state.lists[destination.droppableId],
                            source,
                            destination
                        )
                    }
                });
                break;
            default:
                // Debugger;
                this.setState(
                    move(
                        this.state.lists[source.droppableId],
                        this.state.lists[destination.droppableId],
                        source,
                        destination
                    )
                );
                break;
        }
    };

    addList = (e) => {
        this.setState({ [uuid()]: [] });
    };

    componentDidMount() {
        const triggerContainer = document.getElementById('trigger-container');
        if (triggerContainer) {
            triggerContainer.addEventListener('click', this.handleTriggerClick);
        }
    }

    updateTime (secondsToAdd = 0) {
        let currentTime = new Date();
        let currentTimeMillis = currentTime.getTime() + (secondsToAdd * 1000);
        let currentUTCTime = new Date(currentTimeMillis).toUTCString();

        return {"ms": currentTimeMillis, "human": currentUTCTime};
    }

// Define the click event handler
    handleTriggerClick = (event) => {
        if (event.target.classList.contains('trigger')) {
            let updatedTime = this.updateTime(globalDelay);
            let glds = globalLaunchDelayMinutes * 60 * 1000;
            let nextPossibleLaunch = this.state.lastLaunch + glds;
            if(updatedTime.ms >= nextPossibleLaunch) {
                this.setState({"lastLaunch": updatedTime.ms});
                alert(`Launching at ${updatedTime.ms} or ${updatedTime.human}`);
            } else {
                alert(`No LAUNCH, must be at least ${globalLaunchDelayMinutes} minute(s) apart.`);
            }
        }
    }

// Don't forget to remove the event listener in componentWillUnmount to avoid memory leaks.
    componentWillUnmount() {
        const triggerContainer = document.getElementById('trigger-container');
        if (triggerContainer) {
            triggerContainer.removeEventListener('click', this.handleTriggerClick);
        }
    }

    // Normally you would want to split things out into separate components.
    // But in this example, everything is just done in one place for simplicity
    render() {
        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                {isNotTop && (
                    <React.Fragment>
                        <Delay>
                            <div class="logo"></div>
                        </Delay>
                        <DeadZone>
                            <AssetSelect
                                onAssetSelectChange={
                                    this.handleAssetSelectChange
                                }
                            />
                        </DeadZone>
                    </React.Fragment>
                )}
                <Droppable droppableId="ITEMS" isDropDisabled={true}>
                    {(provided, snapshot) => (
                        <Kiosk
                            innerRef={provided.innerRef}
                            isDraggingOver={snapshot.isDraggingOver}>
                            <ColumnHeader>E D I T O R I A L</ColumnHeader>
                            {this.hasContentId &&
                                this.state.moments.map((item, index) => (
                                    <Draggable
                                        key={item.id}
                                        draggableId={item.id}
                                        index={index}>
                                        {(provided, snapshot) => (
                                            <React.Fragment>
                                                <Item
                                                    innerRef={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    isDragging={
                                                        snapshot.isDragging
                                                    }
                                                    style={
                                                        provided.draggableProps
                                                            .style
                                                    }>
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
                        <div id="trigger-container"> {/* This is the parent element */}
                            {Object.keys(this.state.lists).map((list, i) => {
                                console.log('==> list', list);
                                return (
                                    <Droppable key={list} droppableId={list}>
                                        {(provided, snapshot) => (
                                            <Container
                                                innerRef={provided.innerRef}
                                                isDraggingOver={
                                                    snapshot.isDraggingOver
                                                }>
                                                {this.state.lists[list].length ? (
                                                    this.state.lists[list].map(
                                                        (item, index) => (
                                                            <Draggable
                                                                key={item.id}
                                                                draggableId={
                                                                    item.id
                                                                }
                                                                index={index}>
                                                                {(
                                                                    provided,
                                                                    snapshot
                                                                ) => (
                                                                    <Item
                                                                        innerRef={
                                                                            provided.innerRef
                                                                        }
                                                                        {...provided.draggableProps}
                                                                        isDragging={
                                                                            snapshot.isDragging
                                                                        }
                                                                        style={
                                                                            provided
                                                                                .draggableProps
                                                                                .style
                                                                        }>
                                                                        <Handle
                                                                            {...provided.dragHandleProps}>
                                                                            <svg
                                                                                width="24"
                                                                                height="24"
                                                                                viewBox="0 0 24 24">
                                                                                <path
                                                                                    fill="currentColor"
                                                                                    d="M3,15H21V13H3V15M3,19H21V17H3V19M3,11H21V9H3V11M3,5V7H21V5H3Z"
                                                                                />
                                                                            </svg>
                                                                        </Handle>
                                                                        <table width="100%">
                                                                            <tbody>
                                                                            <tr>
                                                                                <td width="10%">{item.momentNumber}</td>
                                                                                <td width="40%" align="center">{item.title}</td>
                                                                                <td width="20%">
                                                                                    <div className="trigger">LAUNCH</div>
                                                                                </td>
                                                                                <td width="10%">
                                                                                    <span className="material-symbols-outlined">find_replace</span>
                                                                                </td>
                                                                                <td width="10%">
                                                                                    <span className="material-symbols-outlined">delete</span>
                                                                                </td>
                                                                            </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </Item>
                                                                )}
                                                            </Draggable>
                                                        )
                                                    )
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
    }
}

// Put the things into the DOM!
ReactDOM.render(<App />, document.getElementById('root'));

/*
SWAP icon: <a href="https://iconscout.com/icons/swap" class="text-underline font-size-sm" target="_blank">Swap</a> by <a href="https://iconscout.com/contributors/daniel-bruce" class="text-underline font-size-sm" target="_blank">Daniel Bruce</a>

TRASH ICON <a href="https://iconscout.com/icons/trash" class="text-underline font-size-sm" target="_blank">Trash</a> by <a href="https://iconscout.com/contributors/amit-jakhu" class="text-underline font-size-sm" target="_blank">Amit Jakhu</a>
 */
