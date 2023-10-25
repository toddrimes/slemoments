import React from 'react';

class AssetSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            assetIndex: 0,
            assets: [],
            isLoading: true
        };
    }

    handleChange = (e) => {
        const selectedAssetId = e.target.value;
        this.setState({ assetIndex: selectedAssetId });
        this.props.onAssetSelectChange(selectedAssetId); // Call the callback function
    };

    componentDidMount() {
        fetch(
            'https://momentsapi-tr-0b46d75889bf.herokuapp.com/api/dnoc/assets'
        )
            .then((response) => response.json())
            .then((data) => {
                let items = data.items;
                let index = Math.floor(Math.random() * items.length);
                console.log(items);
                this.setState({
                    assets: items,
                    isLoading: false,
                    assetIndex: index
                });
            });
    }

    render() {
        if (this.state.isLoading) {
            return <p>Loading ....</p>;
        } else {
            return (
                <React.Fragment>
                    <span>Assets</span>&nbsp;&nbsp;&nbsp;
                    <select
                        value={this.state.assetIndex}
                        onChange={this.handleChange}>
                        <option key="null" value="null">
                            Choose an asset:{' '}
                        </option>
                        {Array.isArray(this.state.assets) &&
                            this.state.assets.map((asset, i) => (
                                <option
                                    key={'asset' + i}
                                    value={this.state.assets[i]._id}>
                                    {asset.title}
                                </option>
                            ))}
                    </select>
                </React.Fragment>
            );
        }
    }
}

export default AssetSelect;
