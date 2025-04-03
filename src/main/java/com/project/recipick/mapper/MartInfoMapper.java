package com.project.recipick.mapper;

import com.project.recipick.Entity.MartInfo;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MartInfoMapper {
    List<MartInfo> findAll();

    List<MartInfo> findSameMartInfo(String M_NAME);

    List<MartInfo> findMartInfoByMartNames(List<String> martNames);

}
