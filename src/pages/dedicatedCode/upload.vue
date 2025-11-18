<template>
  <view>
    <u-upload :fileList="fileList" :accept="type" :maxCount="MAX_UPLOAD_COUNT" @afterRead="handleUpload" @delete="$emit('delete', $event)"></u-upload>
  </view>
</template>
<script>
  const MAX_UPLOAD_COUNT = 9;
  export default {
    props: {
      value: {
        type: Array,
        default: () => []
      },
      type: {
        type: String,
        default: 'image'
      }
    },
    data() {
      return {
        fileList: [],
        MAX_UPLOAD_COUNT
      };
    },
    methods: {
      async handleUpload(event) {
        const { file } = event;
        this.fileList.push({
          ...file,
          status: 'uploading',
          message: '上传中'
        });
        // 使用 uniapp 的上传文件 API
        const { data } = await new Promise((resolve, reject) => {
          uni.uploadFile({
            url: '/api/common/uploadFile2Cos',
            filePath: file.url,
            name: 'file',
            formData: {
              fileName: file.name
            },
            success: (res) => {
              if (res.statusCode === 200) {
                const data = JSON.parse(res.data);
                resolve(data);
              } else {
                reject(new Error('上传失败'));
              }
            },
            fail: (err) => {
              reject(err);
            }
          });
        });
        this.fileList.splice(this.fileList.length - 1, 1, {
          ...data,
          status: 'success',
          message: '上传成功'
        });
        this.$emit('input', this.fileList);
      }
    }
  };
</script>
