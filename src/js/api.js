import axios from "axios";
import instance from  "./axios";
import { ElMessage } from "element-plus";

export const getTest = async () => {
    const res = await instance.get('https://run.mocky.io/v3/ecef9a81-a4a4-4b7f-8680-a3d25bfa6ece')
    if (res.status !== 200) {
        throw new Error('请求失败');
    }
    return res.data;
}

export const getUserInfoById = async (userId) => {
    try {
        const res = await instance.get(`/user/info?user_id=${userId}`)
        if (res.status !== 200) {
            throw new Error('获取用户信息失败')
        }
        console.log(res.data.data);
        return res.data.data
    } catch (error) {
        console.error('获取用户信息错误:', error.response || error)
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取用户信息失败，请稍后重试')
    }
}

export const getCourseInfoById = async (courseId) => {
    const res = await instance.get(`/course/info?course_id=${courseId}`)
    if (res.status !== 200) {
        throw new Error('请求失败');
    }
    console.log('获取课程信息:', res)
    return res.data;
}

export const createClass = async (courseId, className) => {
    try {
        const res = await instance.post('/class/create', {
            course_id: courseId,
            name: className
        });
        if (res.status !== 200) {
            throw new Error('创建班级失败');
        }
        console.log('创建班级:', res);
        return res.data.data;
    } catch (error) {
        console.error('创建班级错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '创建班级失败，请稍后重试');
    }
}

export const getClassInfoById = async (classId) => {
    try {
        const res = await instance.get(`/class/info?class_id=${classId}`);
        if (res.status !== 200) {
            throw new Error('获取班级信息失败');
        }
        console.log('获取班级信息:', res);
        return res.data;
    } catch (error) {
        console.error('获取班级信息错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取班级信息失败，请稍后重试');
    }
}

export const sendVerificationCode = async (email) => {
    try {
        console.log('正在发送验证码到邮箱:', email)
        const res = await instance.get('/user/verify', {
            params: {
                mail: email
            }
        })
        console.log('验证码发送响应:', res)
        if (res.status !== 200) {
            throw new Error('验证码发送失败')
        }
        return res.data
    } catch (error) {
        console.error('验证码发送错误:', error.response || error)
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '验证码发送失败，请稍后重试')
    }
}

export const login = async (account, password) => {
    try {
        const res = await instance.post('/user/login', {
            account: account,
            password: password
        })
        console.log(res)
        if (res.status != '200') {
            throw new Error('登录失败')
        }
        // 保存token到localStorage
        if (res.data.data && res.data.data.token) {
            const token = res.data.data.token
            localStorage.setItem('token', token)
            // 设置后续请求的token
            // 保存用户信息
            localStorage.setItem('userId', res.data.data.user.user_id)
            localStorage.setItem('userIdentity', res.data.data.user.identity)
        }
        return res.data
    } catch (error) {
        console.error('登录错误:', error.response || error)
        
        throw new Error(error.response?.data?.message || '登录失败，请稍后重试')
    }
}

export const register = async (registerData) => {
    console.log(registerData)
    try {
        const res = await instance.post('/user/reg', registerData)
        console.log(res)
        if (res.status !== 200) {
            throw new Error('注册失败')
        }
        return res.data
    } catch (error) {
        console.error('注册错误:', error.response || error)
        throw new Error(error.response?.data?.message || '注册失败，请稍后重试')
    }
}

export const getUserCourses = async (userId) => {
    const res = await instance.get(`/course/self?user_id=${userId}`);
    if (res.status !== 200) {
        throw new Error('请求失败');
    }
    return res.data;
}

export const getUserTodolist = async (userId, isTeacher, hasAssistantRole) => {
    try {
        if (isTeacher) {
            // 老师调用 exer/self
            const res = await instance.get(`/check/todo?course_id=-1&user_id=${userId}`);
            if (res.status !== 200) {
                throw new Error('请求失败');
            }
            return [res.data.data]; // 返回单个列表的数组
        } else if (hasAssistantRole) {
            // 助教同时调用两个接口
            const [studentRes, assistantRes] = await Promise.all([
                instance.get(`/exer/allTodo?user_id=${userId}`),
                instance.get(`/check/todo?course_id=-1&user_id=${userId}`)
            ]);
            if (studentRes.status !== 200 || assistantRes.status !== 200) {
                throw new Error('请求失败');
            }
            return [studentRes.data.data, assistantRes.data.data]; // 返回两个列表的数组
        } else {
            // 学生调用 exer/allSelf
            const res = await instance.get(`/exer/allTodo?user_id=${userId}`);
            if (res.status !== 200) {
                throw new Error('请求失败');
            }
            return [res.data.data]; // 返回单个列表的数组
        }
    } catch (error) {
        ElMessage({
            type:'error',
            message:error.response.data.errorMsg
        })
        console.error('获取代办列表失败:', error);
        throw error;
    }
}

export const getUserTasks = async (userId, isTeacher, hasAssistantRole) => {
    try {
        if (isTeacher) {
            // 老师调用 exer/self
            const res = await instance.get(`/exer/self?user_id=${userId}`);
            if (res.status !== 200) {
                throw new Error('请求失败');
            }
            return [res.data.data]; // 返回单个列表的数组
        } else if (hasAssistantRole) {
            // 助教同时调用两个接口
            const [studentRes, assistantRes] = await Promise.all([
                instance.get(`/exer/alldone?user_id=${userId}`),
                instance.get(`/exer/self?user_id=${userId}`)
            ]);
            if (studentRes.status !== 200 || assistantRes.status !== 200) {
                throw new Error('请求失败');
            }
            console.log("作为助教的任务",assistantRes.data.data);
            return [studentRes.data.data, assistantRes.data.data]; // 返回两个列表的数组
        } else {
            // 学生调用 exer/allSelf
            const res = await instance.get(`/exer/alldone?user_id=${userId}`);
            if (res.status !== 200) {
                throw new Error('请求失败');
            }
            return [res.data.data]; // 返回单个列表的数组
        }
    } catch (error) {
        ElMessage({
            type:'error',
            message:error.response.data.errorMsg
        })
        console.error('获取任务列表失败:', error);
        throw error;
    }
}

// 获取用户题目列表
export const getUserQuestions = async (userId, isTeacher, hasAssistantRole) => {
  try {
    if (isTeacher) {
      // 教师身份，获取创建的题目
      console.log('开始获取教师id为',userId,'的题目')
      
      const response = await instance.get(`/problem/self`,{
        params:{
            user_id:userId,
        }
      });
      console.log('响应信息为',response.data.success)
      console.log('题目信息为',response.data.data)
      return [response.data.data || []];
    } else if (hasAssistantRole) {
      // 助教身份，获取作为学生和助教的题目
      const [colloctResponse,wrongResponse, assistantResponse] = await Promise.all([
        instance.get(`/collect/getLike?stu_id=${userId}`),
        instance.get(`/collect/getWrong?stu_id=${userId}`),
        instance.get(`/problem/self?user_id=${userId}`)
      ]);
      //console.log('题目信息为',colloctResponse.data.data,wrongResponse.data.data)
      console.log('获取到的错题列表是',wrongResponse.data.data[0])
      return [colloctResponse.data.data || [],wrongResponse.data.data[0] || [], assistantResponse.data.data || [],wrongResponse.data.data[1] || []];
    } else {
      // 学生身份，获取需要完成的题目
      const [colloctResponse,wrongResponse] = await Promise.all([
        instance.get(`/collect/getLike?stu_id=${userId}`),
        instance.get(`/collect/getWrong?stu_id=${userId}`)
      ]);
      return [colloctResponse.data.data || [],wrongResponse.data.data[0] || [],[],wrongResponse.data.data[1] || []];
    }
  } catch (error) {
    ElMessage({
            type:'error',
            message:error.response.data.errorMsg
        })
    console.error('获取题目列表失败:', error);
    throw new Error(error.response?.data?.message || '获取题目列表失败，请稍后重试');
  }
};
export const getQuestionInfo = async (questionId) => {
    const res = await instance.get(`/problem/info?id=${questionId}`)
    if(res.success===false){
        ElMessage({
            message: res.errorMsg,
            type:'error',
            duration:2000
            });
    }
    return res.data.data;
}

// 获取未批改学生列表
export const getUnmarkedStudents = async (exer_id) => {
    try {
        const res = await instance.get(`/check/stu?exer_id=${exer_id}`);
        if (res.status !== 200) {
            throw new Error('获取未批改学生列表失败');
        }
        return res.data;
    } catch (error) {
        ElMessage({
            type:'error',
            message:error.response.data.errorMsg
        })
        console.error('获取未批改学生列表错误:', error.response || error);
        throw new Error(error.response?.data?.message || '获取未批改学生列表失败，请稍后重试');
    }
};
// 获取批改详情
export const getCheckDetail = async (exer_id, user_id) => {
    try {
        const res = await instance.get(`/check/get?exer_id=${exer_id}&user_id=${user_id}`);
        if (res.status !== 200) {
            throw new Error('获取批改详情失败');
        }
        return res.data.data;
    } catch (error) {
        // 处理错误
        ElMessage({
            type:'error',
            message:error.response.data.errorMsg
        })
        console.error('获取批改详情错误:', error.response || error);
        throw new Error(error.response?.data?.message || '获取批改详情失败，请稍后重试');
    }
};
// 提交批改
export const pushCheckInfo = async (user_id, exer_id, scores, infos) => {
    try {
        console.log('正在提交批改信息:')
        const res = await instance.post(`/check/push?user_id=${user_id}&exer_id=${exer_id}&scores=${scores}&infos=${infos}`);
        console.log('提交批改响应:', res.data.data);
        if (res.status !== 200) {
            console.log(res.data.errorMsg)
            throw new Error('提交批改失败');
        }
        return res.data.data;
    } catch (error) {
        ElMessage({
            type:'error',
            message:error.response.data.errorMsg
        })
        console.error('提交批改错误:', error.response || error);
        throw new Error(error.response?.data?.message || '提交批改失败，请稍后重试');
    }
};
export const pushWrongQuestion = async(probId,exerId,stuId)=>{
    try {
        const res = await instance.post(`/collect/addWrong?prob_id=${probId}&exer_id=${exerId}&stu_id=${stuId}`);
        console.log('提交错题响应:', res);
        if (res.status !== 200) {
            throw new Error('提交错题失败');
        }
        return res.data.data;
    } catch (error) {
        ElMessage({
            type:'error',
            message:error.response.data.errorMsg
        })
        console.error('提交错题错误:', error.response || error);
        throw new Error(error.response?.data?.message || '提交错题失败，请稍后重试');
    }
}
export const getTeacherNameById = async (userId) => {
    const res = await instance.get(`/user/info?user_id=${userId}`);
    if(res.success===false){
        ElMessage({
            message: res.errorMsg,
            type:'error',
            duration:2000
            });
    }
    console.log('老师的名字为:',res.data.data.name);
    return res.data.data.name;
};

export const getAllCourseList = async () =>{
    try{
        const res = await instance.get('/course/all');
        if (res.status !== 200) {
            throw new Error('获取课程列表失败');
        }
        return res.data.data;
    }catch (error) {
        console.error('获取课程列表错误:', error.response || error);
        throw new Error(error.response?.data?.message || '获取课程列表失败，请稍后重试');
    }
}
export const getExerAllinfoById = async (exerId) => {
    try {
        const res = await instance.get(`/exer/info?exer_id=${exerId}`);
        if (res.status !== 200) {
            throw new Error('获取练习名称失败');
        }
        return res.data.data;
    } catch (error) {
        console.error('获取练习名称错误:', error.response || error);
        throw new Error(error.response?.data?.message || '获取练习名称失败，请稍后重试');
    }
}
export const getExerQuestionById = async (exerId) => {
    try {
        const res = await instance.get(`/exer/get?exer_id=${exerId}`);
        console.log('获取练习题目响应:', res.data.data);
        if (res.status !== 200) {
            throw new Error('获取练习题目失败');
        }
        return res.data.data;
    } catch (error) {
        console.error('获取练习题目错误:', error.response || error);
        throw new Error(error.response?.data?.message || '获取练习题目失败，请稍后重试');
    }
}
export const saveExerciseAnswer = async (exerId, userId, answers) => {
    try {
        console.log('正在暂存练习答案:', { exerId, userId, answers });
        console.log('答案列表',answers.value);
        const res = await instance.post(`/exer/save`,{
            exer_id:exerId,
            user_id:userId,
            anslist:answers.value
        });
        console.log('暂存练习答案响应:', res.data.data);
        if (res.status !== 200) {
            throw new Error('暂存练习答案失败');
        }
        return res.data.data;
    } catch (error) {
        console.error('提交暂存练习答案错误:', error);
        throw new Error(error.response?.data?.message || '暂存失败，请稍后重试');
    }
}

export const submitExercise = async (exerId,userId)=>{
    try {
        console.log('正在提交练习:', { exerId,userId});
        const res = await instance.post(`/exer/submit`,{
            exer_id:exerId,
            user_id:userId
        });
        console.log('提交练习响应:', res.data.data);
        if (res.status !== 200) {
            throw new Error('提交练习失败');
        }
        return res.data.data;
    } catch (error) {
        console.error('提交练习错误:', error);
        throw new Error(error.response?.data?.message || '提交练习失败，请稍后重试');
    }   
}
export const pushCollectProblem = async(probID,stuID) =>{
    try {
        const res = await instance.post(`/collect/addLike?prob_id=${probID}&stu_id=${stuID}`);
        console.log('提交收藏题目响应:', res.data.data);
        if (res.status !== 200) {
            throw new Error('提交收藏题目失败');
        }
        return res.data.data;
    } catch (error) {
        console.error('提交收藏题目错误:', error.response || error);
        throw new Error(error.response?.data?.message || '提交收藏题目失败，请稍后重试');
    }
}
export const deleteCollectProblem = async(probID,stuID)=>{
    try {
        const res = await instance.delete(`/collect/deleteLike?prob_id=${probID}&stu_id=${stuID}`);
        console.log('删除收藏题目响应:', res.data.data);
        if (res.status !== 200) {
            throw new Error('删除收藏题目失败');
        }
        return res.data.data;
    } catch (error) {
        console.error('删除收藏题目错误:', error.response || error);
        throw new Error(error.response?.data?.message || '删除收藏题目失败，请稍后重试');
    }
}
export const getCollectProblem = async(stuID)=>{
    try {
        const res = await instance.get(`/collect/getLike?stu_id=${stuID}`);
        console.log('获取收藏题目响应:', res.data.data);
        if (res.status !== 200) {
            throw new Error('获取收藏题目失败');
        }
        return res.data.data;
    } catch (error) {
        console.error('删除收藏题目错误:', error.response || error);
        throw new Error(error.response?.data?.message || '删除收藏题目失败，请稍后重试');
    }
}
export const getClassListByCourseId = async (courseId,userId) => {
    try {
        const res = await instance.get(`/course/userClass`,{
            params: {
                course_id: courseId,
                user_id: userId
            }
        })
        if (res.status !== 200) {
            throw new Error('获取班级列表失败')
        }
        console.log('获取班级列表:', res)
        return res.data
    } catch (error) {
        console.error('获取班级列表错误:', error.response || error)
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取班级列表失败，请稍后重试')
    }
}
export const getAllClassListByCourseId = async (courseId,userId) => {
    try {
        const res = await instance.get(`/course/classes`,{
            params: {
                course_id: courseId,
                user_id: userId
            }
        })
        if (res.status !== 200) {
            throw new Error('获取班级列表失败')
        }
        console.log('获取所有班级列表:', res)
        return res.data
    } catch (error) {
        console.error('获取班级列表错误:', error.response || error)
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取班级列表失败，请稍后重试')
    }
}
export const getStudentListByClassId = async (courseId,classId,userId) => {
    try {
        const res = await instance.get(`/class/stu`,{
            params: {
                course_id: courseId,
                class_id: classId,
                user_id: userId
            }
        })
        if (res.status !== 200) {
            throw new Error('获取班级列表失败')
        }
        console.log('获取班级列表:', res)
        return res.data
    } catch (error) {
        console.error('获取班级列表错误:', error.response || error)
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取班级列表失败，请稍后重试')
    }
}
export const createCourse = async (courseName,creatorId,syllbus,assMethod,score,time) => {
    try {
        const res = await instance.post('/course/create',{
            name: courseName,
            creator_id: creatorId,
            syllabus: syllbus,
            assMethod: assMethod,
            score: score,
            time: time
        })
        if (res.status !== 200) {
            throw new Error('创建课程失败')
        }
        console.log('创建课程:', res)
        return res.data
    }
    catch (error) {
        console.error('创建课程错误:', error.response || error)
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '创建课程失败，请稍后重试')
    }
}
export const fetchAllStudents = async() =>{
    try {
        const res = await instance.get('/stu/allStu')
        if (res.status !== 200) {
            throw new Error('获取所有学生失败')
        }
        console.log('获取所有学生:', res)
        return res.data
    } catch (error) {
        console.error('获取所有学生错误:', error.response || error)
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取所有学生失败，请稍后重试')
    }
}
export const fetchAllTeachers = async() =>{
    try {
        const res = await instance.get('/teacher/allteacher')
        if (res.status !== 200) {
            throw new Error('获取所有教师失败')
        }
        console.log('获取所有教师:', res)
        return res.data
    } catch (error) {
        console.error('获取所有教师错误:', error.response || error)
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取所有教师失败，请稍后重试')
    }
}
export const addAssAndTeaToCourse = async (userName,courseId)=>{
    try {
        const res = await instance.post('/course/addAdmin',{
            username: userName,
            course_id: courseId
        })
        if (res.status !== 200) {
            throw new Error('添加教师或助教失败')
        }
        console.log('添加教师或助教:', res)
        return res.data
    } catch (error) {
        console.error('添加教师或助教错误:', error.response || error)
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '添加教师或助教失败，请稍后重试')
    }
}
export const getTeacherListByCourseId = async (courseId) => {
    try {
        const res = await instance.get(`course/admins`, {
            params: {
                course_id: courseId
            }
        })
        if (res.status !== 200) {
            throw new Error('获取教师列表失败')
        }
        console.log('获取教师列表:', res)
        return res.data
    } catch (error) {
        console.error('获取教师列表错误:', error.response || error)
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取教师列表失败，请稍后重试')
    }
}
export const getProcessesByClassId = async(courseId,classId)=>{
    try {
        const res = await instance.get('/process/get', {
            params: {
                course_id: courseId,
                class_id: classId
            }
        })
        if (res.status !== 200) {
            throw new Error('获取进度列表失败')
        }
        console.log('获取进度列表:', res)
        return res.data
    } catch (error) {
        console.error('获取进度列表错误:', error.response || error)
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取进度列表失败，请稍后重试')
    }
}
export const getResourcesByProcessId = async(courseId,processId)=>{
    try {
        const res = await instance.get('/process/resource/all', {
            params: {
                course_id: courseId,
                process_id: processId
            }
        })
        if (res.status !== 200) {
            throw new Error('获取资源列表失败')
        }
        console.log('获取资源列表:', res)
        return res.data
    } catch (error) {
        console.error('获取资源列表错误:', error.response || error)
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取资源列表失败，请稍后重试')
    }
}
export const getAllTags = async () => {
    try {
        const res = await instance.get('/tag/all')
        if (res.status !== 200) {
            throw new Error('获取标签列表失败')
        }
        console.log('获取标签列表:', res)
        return res.data
    } catch (error) {
        console.error('获取标签列表错误:', error.response || error)
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取标签列表失败，请稍后重试')
    }
}
export const downloadResource = async (resourceId) => {
    try {
        const res = await instance.get(`/process/resource/get`, {
            params: {
                res_id: resourceId
            },
        });
        if (res.status !== 200) {
            throw new Error('下载资源失败');
        }
        return res.data;
    } catch (error) {
        console.error('下载资源错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response?.data?.message || '下载资源失败，请稍后重试'
        });
    }
}
export const getClassOfAssAndTeaOfCourse = async(courseId,userId)=>{
    try {
        const res = await instance.get('/class/adminin', {
            params: {
                course_id: courseId,
                user_id: userId
            }
        })
        if (res.status !== 200) {
            throw new Error('获取班级列表失败')
        }
        console.log('获取班级列表(老师和助教):'+userId, res)
        return res.data
    } catch (error) {
        console.error('获取班级列表错误:', error.response || error)
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取班级列表失败，请稍后重试')
    }
}
export const getStudentListByClassIdAndCourseId = async (courseId, classId,userId) => {
    try {
        const res = await instance.get(`/class/stu`, {
            params: {
                course_id: courseId,
                class_id: classId,
                user_id: userId
            }
        });
        if (res.status !== 200) {
            throw new Error('获取学生列表失败');
        }
        console.log('获取学生列表:', res);
        return res.data;
    } catch (error) {
        console.error('获取学生列表错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取学生列表失败，请稍后重试');
    }
}
export const getHistoryByResourceId = async (resourceId) => {
    try {
        const res = await instance.get(`/process/resource/history`, {
            params: {
                res_id: resourceId
            }
        });
        if (res.status !== 200) {
            throw new Error('获取资源历史记录失败');
        }
        console.log('获取资源历史记录:', res);
        return res.data;
    } catch (error) {
        console.error('获取资源历史记录错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取资源历史记录失败，请稍后重试');
    }
}
export const deleteStudentFromClass = async (courseId, classId, userId) => {
    try{
        const res = await instance.post('/class/delStu', {
            course_id: courseId,
            class_id: classId,
            user_id: userId
        });
        if (res.status !== 200) {
            throw new Error('删除学生失败');
        }
        console.log('删除学生:', res);
        return res.data;
    }
    catch (error) {
        console.error('删除学生错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '删除学生失败，请稍后重试');
    }
}
export const addStudentToClassById = async(courseId,classId,userId,username) => {
    try {
        const res = await instance.post('/class/addStu', {
            course_id: courseId,
            class_id: classId,
            user_id: userId,
            username: username
        });
        if (res.status !== 200) {
            throw new Error('添加学生失败');
        }
        console.log('添加学生:', res);
        return res.data;
    } catch (error) {
        console.error('添加学生错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '添加学生失败，请稍后重试');
    }
}
export const addProcessByClassId = async(name,courseId,classId,time) =>{
    try{
        const res = await instance.post('/process/create',{
            name:name,
            course_id:courseId,
            class_id:classId,
            time:time
        });
        if(res.status !== 200){
            throw new Error('添加进度失败');
        }
        console.log("创建资源",res);
        return res.data;
    }catch(error){
        console.error('添加进度失败:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '添加进度失败');
    }
}
export const getAssAndTeaByClassId = async (classId)=>{
    try {
        const res = await instance.get('class/admins', {
            params: {
                class_id: classId
            }
        });
        if (res.status !== 200) {
            throw new Error('获取班级教师和助教失败');
        }
        console.log('获取班级教师和助教:', res);
        return res.data;
    } catch (error) {
        console.error('获取班级教师和助教错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取班级教师和助教失败，请稍后重试');
    }
}
export const addAssAndTeaToClass = async (classId,userId,courseId)=>{
    try {
        const res = await instance.post('/class/addAdmin', {
            class_id: classId,
            user_id: userId,
            course_id: courseId
        });
        if (res.status !== 200) {
            throw new Error('添加教师或助教到班级失败');
        }
        console.log('添加教师或助教到班级:', res);
        return res.data;
    } catch (error) {
        console.error('添加教师或助教到班级错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '添加教师或助教到班级失败，请稍后重试');
    }
}
export const chooseClassByClassId = async(courseId,classCode,userId)=>{
    try {
        const res = await instance.post('/class/apply', {
            course_id: courseId,
            class_code: classCode,
            user_id: userId
        });
        if (res.status !== 200) {
            throw new Error('加入班级失败');
        }
        console.log('加入班级:', res);
        return res.data;
    } catch (error) {
        console.error('加入班级错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '加入班级失败，请稍后重试');
    }
}
export const getTaskListByClassId = async(courseId,classId)=>{
    try {
        const res = await instance.get('/exer/class/get', {
            params: {
                course_id: courseId,
                class_id: classId
            }
        });
        if (res.status !== 200) {
            throw new Error('获取任务列表失败');
        }
        console.log('获取任务列表:', res);
        return res.data;
    } catch (error) {
        console.error('获取任务列表错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取任务列表失败，请稍后重试');
    }
}
export const getUnCheckedTaskListByCourseId = async(userId,courseId)=>{
    try {
        const res = await instance.get('/check/todo', {
            params: {
                user_id: userId,
                course_id: courseId
            }
        });
        if (res.status !== 200) {
            throw new Error('获取未批改任务列表失败');
        }
        console.log('获取未批改任务列表:', res);
        return res.data;
    } catch (error) {
        console.error('获取未批改任务列表错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取未批改任务列表失败，请稍后重试');
    }
}
export const getUnDoneTaskListOfAllOfStudent = async(userId) =>{
    try {
        const res = await instance.get('/exer/allTodo', {
            params: {
                user_id: userId
            }
        });
        if (res.status !== 200) {
            throw new Error('获取未完成任务列表失败');
        }
        console.log('获取未完成任务列表:', res);
        return res.data;
    } catch (error) {
        console.error('获取未完成任务列表错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取未完成任务列表失败，请稍后重试');
    }
}
export const getAllPrivateTasks = async (userId)=>{
    try {
        const res = await instance.get('/exer/self', {
            params:{
                user_id:userId
            }
            
            
        });
        if (res.status !== 200) {
            throw new Error('获取所有私有任务失败');
        }
        console.log('获取所有私有任务:', res);
        return res.data;
    } catch (error) {
        console.error('获取所有私有任务错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取所有私有任务失败，请稍后重试');
    }
}
export const getAllPublicTasks = async(courseId)=>{
    try {
        const res = await instance.get('/exer/public', {
            params: {
                course_id: courseId
            }
        });
        if (res.status !== 200) {
            throw new Error('获取所有公开任务失败');
        }
        console.log('获取所有公开任务:', res);
        return res.data;
    } catch (error) {
        console.error('获取所有公开任务错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取所有公开任务失败，请稍后重试');
    }
}
export const submitTaskToClass = async(taskId,courseId,classId,creatorId,beginTime,endTime,isMulti,name,toEveryClass)=>{
    try {
        const res = await instance.post('/exer/push', {
            exer_id: taskId,
            course_id: courseId,
            class_id: classId,
            creator_id: creatorId,
            begin_time: beginTime,
            end_time: endTime,
            is_multi: isMulti,
            name: name,
            is_every_class: toEveryClass
        });
        if (res.status !== 200) {
            throw new Error('提交任务失败');
        }
        console.log('提交任务:', res);
        return res.data;
    } catch (error) {
        console.error('提交任务错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '提交任务失败，请稍后重试');
    }
}
export const generateReportOfTaskOfAssAndTea = async (taskId) => {
    try {
        const res = await instance.get('/exer/adminReport', {
            params: {
                exer_id: taskId
            }
        });
        if (res.status !== 200) {
            throw new Error('生成任务报告失败');
        }
        console.log('生成任务报告:', res);
        return res.data;
    } catch (error) {
        console.error('生成任务报告错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '生成任务报告失败，请稍后重试');
    }
}
export const generateReportOfTaskOfStu = async (userId)=>{
    try {
        const res = await instance.get('/exer/stuReport', {
            params: {
                user_id: userId
            }
        });
        if (res.status !== 200) {
            throw new Error('生成任务报告失败');
        }
        console.log('生成任务报告:', res);
        return res.data;
    } catch (error) {
        console.error('生成任务报告错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '生成任务报告失败，请稍后重试');
    }
}
export const createQuestion = async (type,is_public,creator_id,description,str_content,answer,analysis)=>{
    try {
        const res = await instance.post('/problem/add', {
            type: type,
            is_public: is_public,
            creator_id: creator_id,
            description: description,
            str_content: str_content,
            answer: answer,
            analysis: analysis
        });
        if (res.status !== 200) {
            throw new Error('创建题目失败');
        }
        console.log('创建题目:', res);
        return res.data;
    } catch (error) {
        console.error('创建题目错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '创建题目失败，请稍后重试');
    }
}
export const getAllPubQuestions = async ()=>{
    try {
        const res = await instance.get('/problem/public',{
            params: {
                types:null
            }
        });
        if (res.status !== 200) {
            throw new Error('获取所有公开题目失败');
        }
        console.log('获取所有公开题目:', res);
        return res.data;
    } catch (error) {
        console.error('获取所有公开题目错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取所有公开题目失败，请稍后重试');
    }
}
export const getAllPriQuestions = async(userId)=>{
    try {
        const res = await instance.get('/problem/self', {
            params: {
                user_id: userId,
                types: null
            }
        });
        if (res.status !== 200) {
            throw new Error('获取所有私有题目失败');
        }
        console.log('获取所有私有题目:', res);
        return res.data;
    } catch (error) {
        console.error('获取所有私有题目错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取所有私有题目失败，请稍后重试');
    }
}
export const createTask = async(courseId,creatorId,beginTime,endTime,isPublic,name,isMulti,probs,scores)=>{
    try {
        const res = await instance.post('/exer/create', {
            course_id: courseId,
            creator_id: creatorId,
            begin_time: beginTime,
            end_time: endTime,
            is_public: isPublic,
            name: name,
            is_multi: isMulti,
            probs: probs,
            scores: scores
        });
        if (res.status !== 200) {
            throw new Error('创建任务失败');
        }
        console.log('创建任务:', res);
        return res.data;
    } catch (error) {
        console.error('创建任务错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '创建任务失败，请稍后重试');
    }
}
export const getStuClassByCourseId = async (courseId,userId)=>{
    try {
        const res = await instance.get('/class/stuin', {
            params: {
                course_id: courseId,
                user_id: userId
            }
        });
        if (res.status !== 200) {
            throw new Error('获取学生班级失败');
        }
        console.log('获取学生班级:', res);
        return res.data;
    } catch (error) {
        console.error('获取学生班级列表错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取学生班级列表失败，请稍后重试');
    }
}
export const deleteResource = async (resId) => {
    try {
        const res = await instance.delete('/process/resource/delete', {
            params: {
                res_id: resId
            }
        });
        if (res.status !== 200) {
            throw new Error('删除资源失败');
        }
        console.log('删除资源:', res);
        return res.data;
    } catch (error) {
        console.error('删除资源错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '删除资源失败，请稍后重试');
    }
}
export const getFinishRateOfStudent = async(userId,courseId,clasId)=>{
    try {
        const res = await instance.get('/exer/stu/finish', {
            params: {
                user_id: userId,
                course_id: courseId,
                class_id: clasId
            }
        });
        if (res.status !== 200) {
        throw new Error('获取学生完成率失败');
        }
        console.log('获取学生完成率:', res);
        return res.data;
    } catch (error) {
        console.error('获取学生完成率错误:', error.response || error);
        ElMessage({
        type: 'error',
        message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取学生完成率失败，请稍后重试');
    }
}
export const getTaskFinishStudent = async(exerId)=>{
    try {
        const res = await instance.get(`/exer/checkfinish?exer_id=${exerId}`);
        if (res.status !== 200) {
            throw new Error('获取任务完成学生列表失败');
        }
        console.log('获取任务完成学生列表:', res);
        return res.data;
    } catch (error) {
        console.error('获取任务完成学生列表错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response.data.errorMsg
        });
        throw new Error(error.response?.data?.message || '获取任务完成学生列表失败，请稍后重试');
    }
}
export const modifyProfileMyself = async (userId, name, mail, birthday) => {
    try {
        const res = await instance.post(`user/modify`, {
            user_id: userId,
            name: name,
            mail: mail,
            birthday: birthday,
        });
        if (res.status !== 200) {
            throw new Error('修改用户信息失败');
        }
        console.log('修改用户信息:', res);
        return res.data;
    } catch (error) {
        console.error('修改用户信息错误:', error.response || error);
        ElMessage({
            type: 'error',
            message: error.response?.data?.errorMsg || '修改用户信息失败，请稍后重试'
        });
        throw new Error(error.response?.data?.message || '修改用户信息失败，请稍后重试');
    }
}