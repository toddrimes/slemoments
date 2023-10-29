import React, { useState, useEffect } from 'react';

function AssetSelect(props) {
    const [assetIndex, setAssetIndex] = useState(0);
    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleChange = (e) => {
        const selectedAssetId = e.target.value;
        setAssetIndex(selectedAssetId);
        props.onAssetSelectChange(selectedAssetId);
    };

    useEffect(() => {
        fetch('https://momentsapi-tr-0b46d75889bf.herokuapp.com/api/dnoc/assets')
            .then((response) => response.json())
            .then((data) => {
                let items = data.items;
                let index = Math.floor(Math.random() * items.length);
                console.log(items);
                setAssets(items);
                setIsLoading(false);
                setAssetIndex(index);
            });
    }, []);

    if (isLoading) {
        return <p>Loading ....</p>;
    } else {
        return (
            <React.Fragment>
                <span>Assets</span>&nbsp;&nbsp;&nbsp;
                <select value={assetIndex} onChange={handleChange}>
                    <option key="null" value="null">
                        Choose an asset:{' '}
                    </option>
                    {Array.isArray(assets) &&
                        assets.map((asset, i) => (
                            <option key={'asset' + i} value={assets[i]._id}>
                                {asset.title}
                            </option>
                        ))}
                </select>
            </React.Fragment>
        );
    }
}

export default AssetSelect;
