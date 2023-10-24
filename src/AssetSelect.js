import React from "react";

// note the name of the class must be capitalized
class AssetSelect extends React.Component {
    constructor(props) {
        super(props)
        // assetIndex is the only part of the state that will be changed by the user
        // the property calls assets which is an array of asset objects which will come from reading a json file
        // the isLoading property lets one know when the file has been read
        this.state = {
            assetIndex: 0,
            assets: [],
            isLoading: true
        }
    }

    handleChange = e => {
        // setState() is async
        this.setState({ assetIndex: e.target.value });
        /*
           that means don't do anything here that requires an updated assetIndex
           because of the way the cover image and author are handled (see below)
           they will change when setState has finished
        */
    }

    componentDidMount() {
        //this.setState({ isLoading: true });
        fetch('https://momentsapi-tr-0b46d75889bf.herokuapp.com/api/dnoc/assets')
            .then(response => response.json())
            .then(data => {
                let items = data.items;
                let index = Math.floor(Math.random()*items.length);
                console.log(items);
                this.setState({ assets: items, isLoading: false, assetIndex: index })})
        /*
           the JSON file holds an array, there might be changes if
           the JSON file holds an object with a property that is an array
           something like assets: data --> assets: data.assets
        */
    }

    render() {
        // The following code use React Fragment
        // Recall .map() is a way to loop over an array
        // React requires you to pass in the key={} prop
        // https://reactjs.org/docs/lists-and-keys.html

        /*
           we cannot do the real rendering until the data file is read (asynchronously)
           hence the introduction of the isLoading attribute of the state
        */
        if (this.state.isLoading) {
            return (<p>Loading ....</p>)
        } else {
            return (
                <React.Fragment> {/* React Fragment instead of a div to meet the single parent criterion */}
                    <span>Assets</span>&nbsp;&nbsp;&nbsp;
                    <select value={this.state.assetIndex} onChange={this.handleChange}>
                        <option key="null" value="null">Choose an asset: </option>
                        {
                            Array.isArray(this.state.assets) && this.state.assets.map((asset, i) =>
                                (
                                    <option key={"asset" + i} value={this.state.assets[i]._id}>
                                        {asset.title}
                                    </option>
                                )
                            )
                        }
                    </select>
                </React.Fragment>
            ) //match return
        } // match else of if
    } //match render
} //end AssetSelect class

export default AssetSelect;
