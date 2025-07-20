import React from 'react';
import CollapsibleIframe from './CollapsibleIframe'


const Toeic = () =>{
	const youtubeUrl = "https://www.youtube.com/embed/_vJtE31ogG4?controls=0";
    return(
	<div>
	<CollapsibleIframe src={youtubeUrl} />
	
	<iframe src="https://forms.gle/7PTsidBfWfvSJG857" width="100%" height="500px" title="TOEIC test"></iframe>

	</div>
	)
}

export default Toeic;