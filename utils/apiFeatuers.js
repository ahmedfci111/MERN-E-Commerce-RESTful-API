class apiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }
  filter() {
    // filter
    const queryObj = { ...this.queryString };
    const excludes = ["page", "limit", "sort", "fields", "keyword"];
    excludes.forEach((fild) => delete queryObj[fild]);

    ///filter by gte|gt|let|lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    //sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      console.log(sortBy);
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("createdAt");
    }
    return this;
  }
  limit() {
    //limiting

    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("--v");
    }
    return this;
  }
 search(fields = []) {
  console.log("Search Fields:", fields);
console.log("Keyword:", this.queryString.keyword);

  if (this.queryString.keyword && fields.length > 0) {

    const query = {
      $or: fields.map((field) => ({
        [field]: {
          $regex: this.queryString.keyword,
          $options: "i",
        },
      })),
    };

    this.mongooseQuery = this.mongooseQuery.find(query);
    console.log(this.mongooseQuery.getFilter());
  }

  return this;
}
  pagenation(countDocuments) {
    // pagenation
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 6;
    const skip = (page - 1) * limit;
    const endIndex = page *limit;
    const pagenationResult ={};
    pagenationResult.currentPage = page ;
    pagenationResult.limit = limit;
    pagenationResult.numberOfPages=Math.ceil(countDocuments / limit);
    //next page 
    if(endIndex <countDocuments ){
        pagenationResult.next = page+1;
    }
    if(skip>0){
        pagenationResult.prev =page-1;
    }
    this.pagenationResult =pagenationResult
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }
  
}

module.exports = apiFeatures
