import {Button, Progress, Tooltip} from 'antd';
import {CloseCircleOutlined} from '@ant-design/icons';
import Linkify from 'react-linkify';

const AddLessonForm =({
    values, 
    setValues, 
    handleAddLesson, 
    uploading, 
    uploadButtonText, 
    handleVideo, 
    progress,
    handleVideoRemove,
})=>{



    return <div className="container pt-3">
        <form onSubmit={handleAddLesson}>
            <input
              type="text"
              className="form-control square"
              onChange={(e)=> setValues({...values, title: e.target.value})}
              value={values.title}
              placeholder="Title"
              autoFocus
              required
            />

            <Linkify>
            <textarea
              className="form-control mt-3"
              cols="7"
              rows="7"
              onChange={(e)=> setValues({...values, content: e.target.value})}
              value={values.content}
              placeholder="Content"
            ></textarea>
            </Linkify>

            <div className="d-flex justify-content-center">
              <label className="btn btn-dark btn-block text-left mt-3 form-control">
                {uploadButtonText}
                <input onChange={handleVideo} type="file" accept="video/*" hidden/>
               </label>
               {!uploading && values.video.Location && (
                   <Tooltip title="Remove">
                       <span onClick={handleVideoRemove} className="pt-1 pl-3">
                           <CloseCircleOutlined className="text-danger d-flex justify-content-center pt-4 p-1 pointer"/>

                       </span>
                   </Tooltip>

                )}
            </div>
           <hr/>
            {progress > 0 && (
                <Progress
                   className="d-flex justify-content-center pt-2 form-control"
                   percent={progress}
                   steps={10}
                />
            )}

            <Button 
              onClick={handleAddLesson} 
              className="col mt-3 form-control" 
              size="large"
              type="primary"
              loading={uploading}
              shape="round"
            >Save</Button>
        </form>
    </div>
};

export default AddLessonForm;

