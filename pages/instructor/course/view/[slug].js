import {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import InstructorRoute from '../../../../components/routes/InstructorRoute';
import axios from 'axios';
import {Avatar, Tooltip, Button, Modal, List} from 'antd';
import {EditOutlined, CheckOutlined, UploadOutlined, QuestionCircleOutlined, QuestionOutlined, CloseOutlined, UserSwitchOutlined} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import AddLessonForm from '../../../../components/forms/AddLessonForm';
import {toast} from 'react-toastify';
import Item from 'antd/lib/list/Item';

const CourseView = ()=>{
    const [course, setCourse] = useState({});
    //for lessons
    const [visible, setVisible]= useState(false);
   const [values, setValues] = useState({
       titile: "",
       content: "",
       video: {},
   });
   const [uploading, setUploading] = useState(false);
   const [uploadButtonText, setUploadButtonText]= useState("Upload Video");
   const [progress, setProgress] = useState(0);
   // for student count
   const [students, setStudents] = useState(0);

    const router = useRouter();
    const {slug} = router.query;

    useEffect(()=>{
        //console.log(slug);
        loadCourse()
    }, [slug]);

    useEffect(()=>{
        course && studentCount();
    },[course])

    const loadCourse = async()=>{
        const {data}= await axios.get(`/api/course/${slug}`);
        setCourse(data);
    };

    const studentCount = async ()=>{
        const {data} = await axios.post('/api/instructor/student-count',{
            courseId: course._id,
        });
        console.log("STUDENT COUNT =>" , data);
        setStudents(data.length);
    }

    //Functions for add lessons
    const handleAddLesson = async ( e )=>{
      e.preventDefault();
     // console.log(values);
     try{
        const {data} = await axios.post(
            `/api/course/lesson/${slug}/${course.instructor._id}`,
             values
            );
            //console.log(data);
            setValues({...values, title:"", content:"", video:{}});
            setProgress(0);
            setUploadButtonText("Upload Video");
            setVisible(false);
            setCourse(data);
            toast('Lesson Added');
     }catch(err){
         console.log(err);
         toast('Lesson add failed');
     }
    }

    const handleVideo = async (e) =>{
        try{
            const file = e.target.files[0];
            setUploadButtonText(file.name);
            setUploading(true);

            const videoData = new FormData();
            videoData.append('video', file);
            //save progress bar and send video as form data to backend
            const {data}= await axios.post(`/api/course/video-upload/${course.instructor._id}`, videoData,{
                onUploadProgress: (e)=>{
                    setProgress(Math.round((100*e.loaded)/ e.total))
                }
            })
            //once response is received
            console.log(data)
            setValues({...values, video:data})
            setUploading(false);
        }catch(err){
            setUploading(false);
            console.log(err);
            toast("Video Upload failed");
        }
    };

    const handleVideoRemove = async()=>{
        //
       // console.log("handle remove video");
       try{
        setUploading(true);
           const {data}= await axios.post(
               `/api/course/video-remove/${course.instructor._id}`, 
               values.video
            );
           console.log(data);
           setValues({...values, video: {}});
           setProgress(0);
           setUploading(false);
           setUploadButtonText("Upload another video");
       }catch(err){
         setUploading(false);
         console.log(err);
         toast("Video remove failed");
       }
    };

    const handlePublish =  async (e, courseId)=>{
        try{
            let answer = window.confirm(
                "Once you publish the course, it will be live in the marketplace for users to enroll"
            );
            if(!answer) return;
            const {data} = await axios.put(`/api/course/publish/${courseId}`);
            setCourse(data);
            toast('Congrats! Your course is live.');

        }catch(err){
            toast('Course publish failed. Try again!');
        }
     }

    const handleUnpublish = async (e, courseId)=>{
        try {
            let answer = window.confirm(
              "Once you unpublish your course, it will not appear in the marketplace for students to enroll."
            );
            if (!answer) return;
            const { data } = await axios.put(`/api/course/unpublish/${courseId}`);
            setCourse(data);
            toast("Your course is now removed from the marketplace!");
            
          } catch (err) {
            toast("Course unpublish failed. Try again");
          }
    }

    return (
        <InstructorRoute>
            <div className="container-fluid pt-3">
                {/* <pre>{JSON.stringify(course, null, 4)}</pre> */}
                {course && (
                    <div className="container-fluid pt-1 ">
                        <div className="  pt-2 flex-shrink-0 d-flex">
                            <Avatar
                              size={80}
                              src={course.image ? course.image.Location : "/course.png"}
                            />

                            <div className="media-body flex-grow-1 ms-3 pl-2">
                                <div className="row">
                                    <div className="col">
                                      <h5 className="mt-2  text-primary">{course.name}</h5> 
                                      <p style={{marginTop: "-10px", fontSize: "15px"}}>
                                          {course.lessons && course.lessons.length} Lessons   
                                      </p> 
                                      <p style={{marginTop: "-15px", fontSize: "15px"}}>
                                           {course.category}
                                      </p>                                
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex ">
                            <Tooltip title={`${students} Enrolled`}>
                                <UserSwitchOutlined className="h5 pointer text-info p-4"/>
                            </Tooltip>

                            <Tooltip title="Edit">
                                <EditOutlined 
                                   onClick={()=>
                                    router.push(`/instructor/course/edit/${slug}`)
                                   }
                                   className="h5 pointer text-warning p-4"/>
                            </Tooltip>


                            {course.lessons && course.lessons.length < 2 ? (<Tooltip title="Minimum 2 lessons are required to publish">
                                <QuestionOutlined className="h5 pointer text-danger p-4"/>

                            </Tooltip>)
                            : course.published ? (<Tooltip title="Unpublish" className="p-4">
                                <CloseOutlined onClick={e=> handleUnpublish(e, course._id)} className="h5 pointer text-danger"/>
                            </Tooltip>
                            ) : (
                            <Tooltip title="Publish" className="p-4">
                                <CheckOutlined onClick={e=> handlePublish(e, course._id)} className="h5 pointer text-success"/>
                            </Tooltip>)}

                        </div>
                        </div>
                        <hr/>
                        <div className="row">
                            <div className="col">
                              <ReactMarkdown children={course.description} />
                            </div>
                        </div>
                        <div className="row">
                            <Button
                              onClick ={()=> setVisible(true)}
                              className="col-md-6 offset-md-3 text-center"
                              type="primary"
                              shape="round"
                              icon={<UploadOutlined/>}
                              size="large"
                            >
                                Add Lesson
                            </Button>
                        </div>
                        <br/>
                        <Modal
                          title="+ Add Lesson"
                          centered
                          visible={visible}
                          onCancel={()=> setVisible(false)}
                          footer={null}
                        >
                            <AddLessonForm 
                              values={values} 
                              setValues={setValues}
                              handleAddLesson={handleAddLesson}
                              uploading={uploading}
                              uploadButtonText={uploadButtonText}
                              handleVideo={handleVideo}
                              progress={progress}
                              handleVideoRemove={handleVideoRemove}
                            />
                        </Modal>
                    <div className="row pb-5">
                        <div className="col lesson-list">
                            <h4>
                                {course && course.lessons && course.lessons.length} Lessons
                            </h4>
                            <List itemLayout="horizontal" dataSource={course && course.lessons} renderItem={(item, index)=>(
                                <Item>
                                    <Item.Meta 
                                       avatar={<Avatar>{index + 1}</Avatar>}
                                       title={item.title}
                                    ></Item.Meta>
                                </Item>
                            )}>
                            </List>
                        </div>
                    </div>
                    </div>
                )}
            </div>
        </InstructorRoute>
    );
};

export default CourseView;