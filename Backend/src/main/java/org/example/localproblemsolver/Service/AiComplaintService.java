package org.example.localproblemsolver.Service;

import com.fasterxml.jackson.core.JsonProcessingException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Schema;
import com.google.genai.types.Type;

import org.example.localproblemsolver.dto.AiApiResponse;
import org.example.localproblemsolver.dto.ComplaintResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


import java.util.HashMap;
import java.util.Map;


@Service
public class AiComplaintService {
    private final Client client;
    private final ObjectMapper objectMapper;

    public AiComplaintService(
            @Value("${gemini.api.key}") String apiKey , ObjectMapper objectMapper) {

        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
        this.objectMapper = objectMapper;

    }
    public AiApiResponse analyzeComplaint(String complaint) {
        try {

            String prompt = """
                    Analyze the following public complaint.
                    
                    Extract the following information:
                    
                    
                    1. problem
                    2. location
                    3. department
                    4. severity(LOW | MEDIUM | HIGH | CRITICAL)
                    5. isValid (tell true or false whether the problem is valid or not)
                    
                    The department MUST be exactly one of these values: 
                    WATER 
                    ELECTRICITY 
                    ROAD 
                    SANITATION 
                    HEALTH 
                    TRANSPORT 
                    OTHER 
                    Do not return any other department name.
                    
                    
                    
                    If a field cannot be found, return an empty string.
                    
                    Complaint:
                    %s
                    """.formatted(complaint);

            Map<String, Schema> properties = new HashMap<>();



            properties.put("problem",
                    Schema.builder()
                            .type(Type.Known.STRING)
                            .build());

            properties.put("location",
                    Schema.builder()
                            .type(Type.Known.STRING)
                            .build());

            properties.put("department",
                    Schema.builder()
                            .type(Type.Known.STRING)
                            .build());

            properties.put("severity",
                    Schema.builder()
                            .type(Type.Known.STRING)
                            .build());
            properties.put("isValid",
                    Schema.builder()
                            .type(Type.Known.BOOLEAN)
                            .build());

            Schema responseSchema = Schema.builder()
                    .type(Type.Known.OBJECT)
                    .properties(properties)
                    .build();

            GenerateContentConfig config =
                    GenerateContentConfig.builder()
                            .responseMimeType("application/json")
                            .responseSchema(responseSchema)
                            .build();

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-3.6-flash",
                            prompt,
                            config
                    );

            String json = response.text();


            return convertJsonToDTO(json);
        } catch (Exception e) {
            throw new RuntimeException( "Failed to analyze complaint", e );
        }
    }
    private AiApiResponse convertJsonToDTO(String json) {


        try {

            return objectMapper.readValue(
                    json,
                    AiApiResponse.class

            );

        } catch (JsonProcessingException e) {

            throw new RuntimeException(
                    "Failed to parse Gemini response" , e
            );
        }
    }
}
